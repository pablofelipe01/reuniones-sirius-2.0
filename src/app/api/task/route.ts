// pages/api/tasks.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const records = await base('Tasks').select({
        view: 'Grid view'
      }).firstPage();
      
      const tasks = records.map(record => ({
        id: record.id,
        ...record.fields
      }));
      
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching tasks' });
    }
  }
}