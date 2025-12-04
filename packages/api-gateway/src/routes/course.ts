import { Router, Request, Response, NextFunction } from 'express';
import { courseClient } from '../grpc-clients';
import { authenticateJWT } from '../middleware/auth';
import { createLogger } from '@pset4/shared-types';

const router = Router();
const logger = createLogger('course-routes');

// GET /courses - List all courses
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

  logger.info('Listing courses', { limit, offset });

  courseClient.ListCourses({ limit, offset }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    res.json({ courses: response.courses });
  });
});

// GET /courses/sections/:courseId
router.get('/sections/:courseId', (req: Request, res: Response, next: NextFunction): void => {
  const { courseId } = req.params;

  if (!courseId) {
    res.status(400).json({ error: 'Course ID required' });
    return;
  }

  logger.info('Listing sections', { courseId });

  courseClient.ListSections({ course_id: courseId }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    res.json({ sections: response.sections });
  });
});

// GET /courses/faculty/sections - Get faculty's sections
router.get('/faculty/sections', authenticateJWT, (req: Request, res: Response, next: NextFunction): void => {
  const faculty_id = req.user!.userId;
  const role = req.user!.role;

  if (role !== 'FACULTY') {
    logger.warn('Non-faculty attempted to access faculty sections', { faculty_id, role });
    res.status(403).json({ error: 'Forbidden: Faculty access required' });
    return;
  }

  logger.info('Getting faculty sections', { faculty_id });

  courseClient.GetFacultySections({ faculty_id }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    res.json({ sections: response.sections });
  });
});

// POST /courses/enroll - Enroll student in section
router.post('/enroll', authenticateJWT, (req: Request, res: Response, next: NextFunction): void => {
  const { section_id } = req.body;
  const student_id = req.user!.userId;

  if (!section_id) {
    res.status(400).json({ error: 'Section ID required' });
    return;
  }

  logger.info('Enrollment attempt', { student_id, section_id });

  courseClient.EnrollStudent({ student_id, section_id }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    if (!response.success) {
      logger.warn('Enrollment failed', {
        student_id,
        section_id,
        message: response.message
      });
      res.status(400).json({
        success: false,
        message: response.message
      });
      return;
    }

    logger.info('Enrollment successful', { student_id, section_id });

    res.json({
      success: true,
      message: response.message
    });
  });
});

// GET /courses/enrollments - Get student's enrollments
router.get('/enrollments', authenticateJWT, (req: Request, res: Response, next: NextFunction): void => {
  const student_id = req.user!.userId;

  logger.info('Getting enrollments', { student_id });

  courseClient.GetEnrollments({ student_id }, (error: any, response: any) => {
    if (error) {
      return next(error);
    }

    res.json({ enrollments: response.enrollments });
  });
});

export default router;

