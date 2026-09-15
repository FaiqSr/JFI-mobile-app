import { useState, useEffect, useCallback } from 'react';
import { csService } from '../api/csService';
import { TaskSession } from '../type/csType';

const getRawList = (res: any, moduleName?: string): any[] => {
  let list: any[] = [];
  if (!res) list = [];
  else if (Array.isArray(res.data?.items)) list = res.data.items;
  else if (Array.isArray(res.items)) list = res.items;
  else if (Array.isArray(res.data)) list = res.data;
  else if (Array.isArray(res)) list = res;

  if (moduleName) {
    return list.map((item) => ({
      ...item,
      module: item.module || item.modul || moduleName,
    }));
  }
  return list;
};

const extractOpenTasksData = (res: any): TaskSession[] => getRawList(res);

const DONE_STATUSES = ['DONE', 'COMPLETED', 'SELESAI'];
const ACTIVE_STATUSES = ['ACTIVE', 'IN_PROGRESS', 'RUNNING', 'BERJALAN'];

const hasSessionTime = (record: any): boolean =>
  !!(
    record?.timeStart ||
    record?.started_at ||
    record?.start_time ||
    record?.time_start ||
    record?.timeEnd ||
    record?.ended_at ||
    record?.completed_at ||
    record?.end_time ||
    record?.finish_time
  );

const isRealSession = (record: any, fallbackStatus?: unknown): boolean => {
  const status = String(record?.status || fallbackStatus || '').toUpperCase();
  return DONE_STATUSES.includes(status) || ACTIVE_STATUSES.includes(status) || hasSessionTime(record);
};

const extractSessionData = (res: any): TaskSession[] => {
  const rawList = getRawList(res);
  const sessionList: TaskSession[] = [];

  rawList.forEach((taskItem: any, idx: number) => {
    const workerSessions = taskItem?.worker_sessions || taskItem?.work_logs;

    if (Array.isArray(workerSessions) && workerSessions.length > 0) {
      // Semua sesi ikut tampil: yang masih berjalan (BERJALAN) maupun yang sudah selesai.
      workerSessions.forEach((session: any, sIdx: number) => {
        if (!isRealSession(session, taskItem?.status)) return;

        sessionList.push({
          ...taskItem,
          ...session,
          id: `session_${taskItem.id || idx}_${session.id || sIdx}`,
          parent_item: taskItem,
        });
      });
    } else if (isRealSession(taskItem)) {
      // Task tanpa child session: hanya dihitung bila task itu sendiri memang sedang/sudah dikerjakan.
      sessionList.push({
        ...taskItem,
        id: `session_${taskItem.id || idx}`,
      });
    }
  });

  return sessionList;
};

const extractHistoryData = (res: any): TaskSession[] => {
  const rawList = getRawList(res);
  const historyLogs: TaskSession[] = [];

  rawList.forEach((taskItem: any, idx: number) => {
    const logs = taskItem?.work_logs || taskItem?.logs;

    if (Array.isArray(logs) && logs.length > 0) {
      logs.forEach((log: any, lIdx: number) => {
        historyLogs.push({
          ...taskItem,
          ...log,
          id: `history_${taskItem.id || idx}_${log.id || lIdx}`,
          parent_item: taskItem,
        });
      });
    } else {
      historyLogs.push({
        ...taskItem,
        id: `history_${taskItem.id || idx}`,
      });
    }
  });

  return historyLogs;
};

export const useCsData = (userToken: string) => {
  const [openTasks, setOpenTasks] = useState<TaskSession[]>([]);
  const [sessions, setSessions] = useState<TaskSession[]>([]);
  const [history, setHistory] = useState<TaskSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAllData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        const [openRes, myRes, meHistoryRes] = await Promise.all([
          csService.getOpenTasks(userToken),
          csService.getMySessions(userToken),
          csService.getRecentHistoryMe ? csService.getRecentHistoryMe(userToken) : Promise.resolve(null),
        ]);

        let userHistoryList: any[] = [];
        if (meHistoryRes) {
          userHistoryList = getRawList(meHistoryRes);
        }

        setOpenTasks(extractOpenTasksData(openRes));
        setSessions(extractSessionData(myRes));
        setHistory(extractHistoryData(userHistoryList));
      } catch (err) {
        console.error('Gagal mengambil data CS:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userToken]
  );

  useEffect(() => {
    if (userToken) {
      fetchAllData();
    }
  }, [userToken, fetchAllData]);

  return { openTasks, sessions, history, loading, refreshing, fetchAllData };
};