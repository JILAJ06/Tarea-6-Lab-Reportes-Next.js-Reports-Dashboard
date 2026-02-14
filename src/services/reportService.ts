import type {
  AttendanceStat,
  CourseStat,
  RankStat,
  StudentRisk,
  TeacherLoad,
} from '@/types/reportTypes';
import * as repo from '@/repositories/reportRepository';

export type { AttendanceStat, CourseStat, RankStat, StudentRisk, TeacherLoad };

export async function getCoursePerformance(term: string): Promise<CourseStat[]> {
  return repo.getCoursePerformance(term);
}

export async function getTeacherLoadPage(
  page: number,
  limit: number
): Promise<{ rows: TeacherLoad[]; total: number }> {
  const offset = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    repo.getTeacherLoad(page),
    repo.getTeacherLoadCount(),
  ]);
  return { rows, total };
}

export async function getStudentsAtRiskPage(
  search: string,
  page: number,
  limit: number
): Promise<{ rows: StudentRisk[]; total: number }> {
  const offset = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    repo.getStudentsAtRisk(search, limit, offset),
    repo.getStudentsAtRiskCount(search),
  ]);
  return { rows, total };
}

export async function getAttendanceByGroup(): Promise<AttendanceStat[]> {
  return repo.getAttendanceByGroup();
}

export async function getRankStudents(program?: string): Promise<RankStat[]> {
  return repo.getRankStudents(program);
}
