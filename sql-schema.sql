-- Create Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id VARCHAR(50) UNIQUE NOT NULL,
    batch_name TEXT NOT NULL,
    exam VARCHAR(100),
    starts_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_teachers INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    teacher_data JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Batch Items Table (for storing videos, PDFs, etc. from external API)
CREATE TABLE IF NOT EXISTS batch_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL,
    item_type VARCHAR(50) NOT NULL, -- 'video', 'pdf', 'assignment', etc.
    title TEXT,
    item_data JSONB NOT NULL,
    external_id VARCHAR(100),
    live_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE
);

-- Create API Responses Table (for tracking external API calls)
CREATE TABLE IF NOT EXISTS api_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    response_data JSONB NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Users Table (legacy compatibility)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_batches_batch_id ON batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_exam ON batches(exam);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batch_items_batch_id ON batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_items_type ON batch_items(item_type);
CREATE INDEX IF NOT EXISTS idx_api_responses_batch_id ON api_responses(batch_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_items_updated_at BEFORE UPDATE ON batch_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample insert statements (using data from the uploaded file)
INSERT INTO batches (batch_id, batch_name, exam, starts_at, completed_at, total_teachers, status, teacher_data) VALUES
('0KFLQAGZ', 'Kota NEET UG 2025 Master Pro 3 (A)', 'NEET UG', '2024-06-10T02:55:00Z', '2025-05-02T11:30:00Z', 23, 'active', '{"teachers": ["Ravi Dubey", "Yogender Singh", "Parvez Khan", "Ashish Gupta", "Insaf Ali", "Fazil Khan", "Anup Kumar Singh", "Maneesh Kumar Sharma", "Wachespati Arya", "Devi Singh", "Mohammad Bilal", "Gajender Aggarwal", "Narendra Kumar Yadav", "Sikander Singh", "Ranjeet Banthiya", "Yogendra Nagar", "Ashish Nimawat", "Devendra Nagar", "Piyush Gupta", "Dr Parvez Babar", "Triyogi Mishra", "Lokesh Yadav", "Mahendra Singh Rajawat"]}'),
('57X1CS08', 'Comprehensive Judiciary batch by Anil Khanna - January 2025', 'Judiciary - PCS (J)', '2025-01-29T05:00:00Z', '2025-07-25T06:00:00Z', 3, 'upcoming', '{"teachers": ["Rittu Dhawan", "Priya Singla", "Anil Khanna"]}'),
('93P3YAJS', 'Kota NEET UG 2025 Excel 2', 'NEET UG', '2024-01-03T08:30:00Z', '2025-05-01T11:30:00Z', 19, 'active', '{"teachers": ["Mahendra Kumar Tiwari", "Yogender Singh", "Anup Kumar Singh", "Insaf Ali", "Devi Singh", "Wachespati Arya", "Dinkar Singh Parihar", "Dr Parvez Babar", "Piyush Gupta", "Manish Kumar Sharma", "Maneesh Kumar Sharma", "Ashish Gupta", "Sharad Mathur", "Yogendra Nagar", "Anurag Garg", "Devendra Nagar", "Lokesh Yadav", "Tarun Yadav", "Sanjay Mishra"]}'),
('0TXHCL6W', 'Gyani Batch for NEET 2024 (Hindi)', 'NEET UG', '2023-05-30T01:15:00Z', '2024-05-02T11:50:00Z', 13, 'completed', '{"teachers": ["Yogendra Nagar", "Niraj Yadav", "Anurag Sukhija", "Sharad Mathur", "Brij Raj Yadav", "Shailendra Tanwar", "Dinkar Singh Parihar", "Maneesh Kumar Sharma", "Manish Kumar Sharma", "Dr Parvez Babar", "Piyush Gupta", "Anurag Garg", "Aashish Bansal"]}'),
('8GXOLUBF', 'Vardhan : Batch for GATE, ESE & PSUs 2027 - EC - E', 'GATE & ESE - EE, EC', '2025-05-28T03:30:00Z', '2025-09-07T17:30:00Z', 2, 'upcoming', '{"teachers": ["Shishir Kumar Das", "Manoj Singh Chauhan"]}')
ON CONFLICT (batch_id) DO UPDATE SET
    batch_name = EXCLUDED.batch_name,
    exam = EXCLUDED.exam,
    starts_at = EXCLUDED.starts_at,
    completed_at = EXCLUDED.completed_at,
    total_teachers = EXCLUDED.total_teachers,
    status = EXCLUDED.status,
    teacher_data = EXCLUDED.teacher_data,
    updated_at = NOW();

-- Insert sample API response (based on the um.php file)
INSERT INTO api_responses (batch_id, endpoint, response_data, status_code, response_time_ms) VALUES
('MFKM644M', 'https://studyuk.fun/um.php?batch_id=MFKM644M', '{
    "batch_uid": "MFKM644M",
    "content": [{
        "teacher": {
            "avatar": "https://edge.uacdn.net/static/thumbnail/user/eff285cf585545e38f754a38e70a2bc9.png?q=100&w=512",
            "first_name": "Amitava",
            "last_name": "Mazumder"
        },
        "videos": [{
            "live_at": "2023-05-18T11:45:00Z",
            "pdf_url": "https://player.uacdn.net/slides_pdf/8VECAND9G8EMERF59B4T/Mole_Concept_and_Concentration_Terms_1_with_anno.pdf",
            "title": "Mole Concept and Concentration Terms: 1",
            "video_url": "https://studyuk.fun/video?token=yQrVE+NSlIvIrUgrUPclYjo6aE51dmVsVTBGK0VhaW1XcFRwQjkwaWxlOWFuREZwMjV3bXNzdmhlV2ZsdDg4eWdqYzhIalFGdk5QZmtmT3VYWUtXd3QwYVdlMm1PQzZWMWJsNkhINUJBd0t4cnhkVitZMzZVc0QyTTZMdU5JWUYzSk1yODZFUk43VFd1SngvTE8=&v=playlist.m3u8"
        }]
    }]
}', 200, 450)
ON CONFLICT DO NOTHING;
