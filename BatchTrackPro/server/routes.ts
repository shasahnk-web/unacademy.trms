import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBatchSchema, insertBatchItemSchema, insertApiResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all batches
  app.get("/api/batches", async (_req, res) => {
    try {
      const batches = await storage.getAllBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  });

  // Get batch by ID
  app.get("/api/batches/:batchId", async (req, res) => {
    try {
      const { batchId } = req.params;
      const batch = await storage.getBatchByBatchId(batchId);
      
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }
      
      res.json(batch);
    } catch (error) {
      console.error("Error fetching batch:", error);
      res.status(500).json({ error: "Failed to fetch batch" });
    }
  });

  // Get batch items
  app.get("/api/batches/:batchId/items", async (req, res) => {
    try {
      const { batchId } = req.params;
      const items = await storage.getBatchItems(batchId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching batch items:", error);
      res.status(500).json({ error: "Failed to fetch batch items" });
    }
  });

  // Sync batch data from external API
  app.post("/api/batches/:batchId/sync", async (req, res) => {
    try {
      const { batchId } = req.params;
      const startTime = Date.now();
      
      // Fetch from external API
      const externalApiUrl = `https://studyuk.fun/um.php?batch_id=${batchId}`;
      const response = await fetch(externalApiUrl);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`External API returned ${response.status}: ${response.statusText}`);
      }
      
      const externalData = await response.json();
      
      // Store API response
      await storage.createApiResponse({
        batchId,
        endpoint: externalApiUrl,
        responseData: externalData,
        statusCode: response.status,
        responseTimeMs: responseTime,
      });
      
      // Process and store batch items
      if (externalData.content && Array.isArray(externalData.content)) {
        const batchItems = [];
        
        for (const contentItem of externalData.content) {
          if (contentItem.videos && Array.isArray(contentItem.videos)) {
            for (const video of contentItem.videos) {
              batchItems.push({
                batchId,
                itemType: "video",
                title: video.title,
                itemData: {
                  ...video,
                  teacher: contentItem.teacher // Include teacher info with each video
                },
                externalId: video.video_url || `${batchId}-${video.title}`,
                liveAt: video.live_at ? new Date(video.live_at) : null,
              });
            }
          }
        }
        
        if (batchItems.length > 0) {
          await storage.upsertBatchItems(batchId, batchItems);
        }
      }
      
      // Update batch metadata
      const batch = await storage.getBatchByBatchId(batchId);
      if (batch) {
        await storage.updateBatch(batchId, {
          metadata: {
            ...batch.metadata as any,
            lastSyncAt: new Date().toISOString(),
            externalDataVersion: externalData.version || "unknown",
          }
        });
      }
      
      // Count total videos processed
      let totalVideosProcessed = 0;
      if (externalData.content && Array.isArray(externalData.content)) {
        for (const contentItem of externalData.content) {
          if (contentItem.videos && Array.isArray(contentItem.videos)) {
            totalVideosProcessed += contentItem.videos.length;
          }
        }
      }

      res.json({ 
        success: true, 
        message: "Batch data synced successfully",
        itemsProcessed: totalVideosProcessed,
        responseTime: responseTime,
      });
      
    } catch (error) {
      console.error("Error syncing batch data:", error);
      res.status(500).json({ 
        error: "Failed to sync batch data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create or update batch
  app.post("/api/batches", async (req, res) => {
    try {
      const validatedData = insertBatchSchema.parse(req.body);
      const batch = await storage.upsertBatch(validatedData);
      res.json(batch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating/updating batch:", error);
      res.status(500).json({ error: "Failed to create/update batch" });
    }
  });

  // Initialize database with sample batches from uploaded file
  app.post("/api/initialize", async (req, res) => {
    try {
      // Read from the uploaded batch file
      const fs = await import('fs');
      const path = await import('path');
      const batchFilePath = path.default.join(process.cwd(), 'attached_assets', 'batch_1753084974876.json');
      
      if (fs.default.existsSync(batchFilePath)) {
        const batchData = JSON.parse(fs.default.readFileSync(batchFilePath, 'utf8'));
        
        if (batchData.batches && Array.isArray(batchData.batches)) {
          let processedCount = 0;
          
          for (const batchInfo of batchData.batches.slice(0, 50)) { // Process first 50 batches
            try {
              const batch = {
                batchId: batchInfo.batch_id,
                batchName: batchInfo.batch_name,
                exam: batchInfo.exam,
                startsAt: batchInfo.starts_at ? new Date(batchInfo.starts_at) : null,
                completedAt: batchInfo.completed_at ? new Date(batchInfo.completed_at) : null,
                totalTeachers: batchInfo.total_teachers || 0,
                status: batchInfo.completed_at && new Date(batchInfo.completed_at) < new Date() ? 'completed' : 'active',
                teacherData: {
                  teachers: Object.keys(batchInfo)
                    .filter(key => key.startsWith('teacher_'))
                    .map(key => batchInfo[key])
                    .filter(Boolean)
                },
              };
              
              await storage.upsertBatch(batch);
              processedCount++;
            } catch (error) {
              console.error(`Error processing batch ${batchInfo.batch_id}:`, error);
            }
          }
          
          res.json({ 
            success: true, 
            message: `Initialized ${processedCount} batches successfully` 
          });
        } else {
          res.status(400).json({ error: "Invalid batch data format" });
        }
      } else {
        res.status(404).json({ error: "Batch data file not found" });
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ error: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
