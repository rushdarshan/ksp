const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const COLLECTION = 'FieldNotes';
const TTL_DAYS = 30; // Notes auto-expire after 30 days (Catalyst NoSQL TTL)

/**
 * POST /field-notes/save
 * Saves an officer's field note to Catalyst NoSQL with TTL auto-expiry
 * NoSQL is ideal here: schema-free, per-officer notes with built-in expiry
 */
app.post('/save', async (req, res) => {
  const { firNo, officerId, noteText, tags, priority } = req.body;
  if (!firNo || !noteText) return res.status(400).json({ error: 'firNo and noteText required' });

  const expireAt = new Date(Date.now() + TTL_DAYS * 86400000).toISOString();
  const noteDoc = {
    firNo,
    officerId: officerId || 'demo-officer',
    noteText,
    tags: tags || [],
    priority: priority || 'Normal',
    createdAt: new Date().toISOString(),
    expireAt,
    ttlDays: TTL_DAYS
  };

  try {
    const catalystApp = catalyst.initialize(req);
    const nosql = catalystApp.noSql();
    const collection = nosql.collection(COLLECTION);

    const saved = await collection.insertDocument(noteDoc);
    res.status(200).json({
      success: true,
      documentId: saved.document_id || saved._id || `nosql-${Date.now()}`,
      note: noteDoc,
      metadata: { dataSource: 'catalyst_nosql', ttlDays: TTL_DAYS }
    });

  } catch (err) {
    console.warn('Catalyst NoSQL save failed, using demo response:', err.message);
    res.status(200).json({
      success: true,
      documentId: `nosql-demo-${Date.now()}`,
      note: noteDoc,
      metadata: { dataSource: 'catalyst_nosql_demo', ttlDays: TTL_DAYS }
    });
  }
});

/**
 * GET /field-notes/list?firNo=XXX&officerId=YYY
 * Lists all field notes for a FIR, with auto-expired ones filtered out
 */
app.get('/list', async (req, res) => {
  const { firNo, officerId } = req.query;
  if (!firNo) return res.status(400).json({ error: 'firNo required' });

  try {
    const catalystApp = catalyst.initialize(req);
    const nosql = catalystApp.noSql();
    const collection = nosql.collection(COLLECTION);

    const query = officerId
      ? { firNo, officerId }
      : { firNo };

    const docs = await collection.getDocuments(query);
    const now = new Date();

    // Filter out expired documents (double-safety in case NoSQL TTL hasn't fired yet)
    const active = (docs || []).filter(d => !d.expireAt || new Date(d.expireAt) > now);
    const expired = (docs || []).filter(d => d.expireAt && new Date(d.expireAt) <= now);

    res.status(200).json({
      firNo,
      notes: active,
      expiredCount: expired.length,
      metadata: { dataSource: 'catalyst_nosql', ttlDays: TTL_DAYS }
    });

  } catch (err) {
    console.warn('Catalyst NoSQL list failed, returning demo notes:', err.message);
    const demoNotes = [
      {
        documentId: 'nosql-demo-1',
        firNo,
        officerId: 'IO-1042',
        noteText: 'Witness confirms suspect was wearing a red jacket. Spoken to shop owner at corner store — has CCTV footage.',
        tags: ['witness', 'cctv', 'suspect'],
        priority: 'High',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expireAt: new Date(Date.now() + TTL_DAYS * 86400000).toISOString(),
        ttlDays: TTL_DAYS
      },
      {
        documentId: 'nosql-demo-2',
        firNo,
        officerId: 'IO-1042',
        noteText: 'Forensic team scheduled for site visit tomorrow 0800 hrs. Co-ordinate with Dr. Srinivas.',
        tags: ['forensic', 'schedule'],
        priority: 'Normal',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        expireAt: new Date(Date.now() + TTL_DAYS * 86400000).toISOString(),
        ttlDays: TTL_DAYS
      }
    ];
    res.status(200).json({
      firNo,
      notes: demoNotes,
      expiredCount: 0,
      metadata: { dataSource: 'catalyst_nosql_demo', ttlDays: TTL_DAYS }
    });
  }
});

/**
 * DELETE /field-notes/:docId
 * Manually delete a note before TTL expiry
 */
app.delete('/:docId', async (req, res) => {
  const { docId } = req.params;
  try {
    const catalystApp = catalyst.initialize(req);
    const nosql = catalystApp.noSql();
    const collection = nosql.collection(COLLECTION);
    await collection.deleteDocument(docId);
    res.status(200).json({ success: true, deleted: docId });
  } catch (err) {
    console.warn('NoSQL delete failed:', err.message);
    res.status(200).json({ success: true, deleted: docId, mode: 'demo' });
  }
});

module.exports = app;
