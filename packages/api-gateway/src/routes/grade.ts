import { Router, Request, Response, NextFunction } from 'express';
import { gradeClient } from '../grpc-clients';
import { authenticateJWT } from '../middleware/auth';
import { createLogger } from '@pset4/shared-types';

const router = Router();
const logger = createLogger('grade-routes');

// GET /grades - Get student's grades
router.get('/', authenticateJWT, (req: Request, res: Response, next: NextFunction): void => {
  const student_id = req.user!.userId;

  logger.info('Getting grades', { student_id });

  gradeClient.GetGrades({ student_id }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    res.json({ grades: response.grades });
  });
});

// POST /grades - Upload grade (Faculty only)
router.post('/', authenticateJWT, (req: Request, res: Response, next: NextFunction): void => {
  const { student_id, section_id, grade_value } = req.body;
  const faculty_id = req.user!.userId;
  const role = req.user!.role;

  if (role !== 'FACULTY') {
    logger.warn('Unauthorized grade upload attempt', { faculty_id, role });
    res.status(403).json({ error: 'Forbidden: Faculty access required' });
    return;
  }

  if (!student_id || !section_id || grade_value === undefined) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info('Uploading grade', { faculty_id, student_id, section_id, grade_value });

  gradeClient.UploadGrade({ student_id, section_id, grade_value, faculty_id }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    if (!response.success) {
      logger.warn('Grade upload failed', { message: response.message });
      res.status(400).json({ success: false, message: response.message });
      return;
    }

    res.json({ success: true, message: response.message });
  });
});

// GET /grades/section/:sectionId - Get section grades (Faculty only)
router.get('/section/:sectionId', authenticateJWT, (req: Request, res: Response, next: NextFunction): void => {
  const { sectionId } = req.params;
  const faculty_id = req.user!.userId;
  const role = req.user!.role;

  if (role !== 'FACULTY') {
    logger.warn('Unauthorized section grades access attempt', { faculty_id, role });
    res.status(403).json({ error: 'Forbidden: Faculty access required' });
    return;
  }

  if (!sectionId) {
    res.status(400).json({ error: 'Section ID required' });
    return;
  }

  logger.info('Getting section grades', { faculty_id, sectionId });

  gradeClient.GetSectionGrades({ section_id: sectionId, faculty_id }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    res.json({ grades: response.grades });
  });
});

export default router;
