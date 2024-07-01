export {}

const router = require('express').Router();
const ReportDaoClass = require('../data/ReportDao');
const ReportDao = new ReportDaoClass();

router.post("/", async (req: any, res: any) => {
  try {
    const {reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName}: {reporterId: string, reporterFirstName: string, reporterLastName: string, content: string, reporteeId: string, reporteeFirstName: string, reporteeLastName: string} = req.body;
    const newReport = await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);
    res.status(201).json({ newReport });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/findAll", async (req: any, res: any) => {
    try {
        const reports = await ReportDao.readAll();
        res.status(200).json({ reports });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/findOne/:id", async (req: any, res: any) => {
    const { id }: { id: number } = req.params;
    try {
      const report = await ReportDao.readOne(id);
      if (!report) {
        return res.status(404).json({ msg: "Report not found" });
      }
      res.status(200).json({ report });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.get("/findAllByReporterId/:reporterId", async (req: any, res: any ) => {
    const {reporterId} = req.params;
    try {
        const reports = await ReportDao.readAllByReporter(reporterId);
        res.status(200).json({ reports });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/findAllByReporteeId/:reporteeId", async (req: any, res: any ) => {
    const {reporteeId} = req.params;
    try {
        const reports = await ReportDao.readAllByReportee(reporteeId);
        res.status(200).json({ reports });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.put("/resolve/:id", async (req: any, res: any) => {
    const id : number = req.params.id;
    try {
        const report = await ReportDao.updateResolved( id );
        if (!report) {
        return res.status(404).json({ msg: "Report not found" });
        }
        res.status(200).json({ report });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.put("/:id", async (req: any, res: any) => {
    const id : number = req.params.id;
    const {reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName}: {reporterId: string, reporterFirstName: string, reporterLastName: string, content: string, reporteeId: string, reporteeFirstName: string, reporteeLastName: string} = req.body;
    try {
        const report = await ReportDao.update( id, reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName );
        if (!report) {
        return res.status(404).json({ msg: "Report not found" });
        }
        res.status(200).json({ report });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.delete("/:id", async (req: any, res: any) => {
    const id : number = req.params.id;
    try {
        const report = await ReportDao.delete(id);
        if (!report) {
        return res.status(404).json({ msg: "Report not found" });
        }
        return res.status(200).json({ msg: "Report deleted successfully" });
    } catch (err) {
        return res.status(500).send("Server Error");
    }
});

module.exports = router;