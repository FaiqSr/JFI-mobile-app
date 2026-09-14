import { TaskSession } from '../type/csType';

export const getRawList = (res: any, moduleName?: string): any[] => {
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

export const extractOpenTasksData = (res: any): TaskSession[] => getRawList(res);

export const extractSessionData = (res: any): TaskSession[] => {
  const rawList = getRawList(res);
  const sessionList: TaskSession[] = [];

  rawList.forEach((taskItem: any, idx: number) => {
    const workerSessions = taskItem?.worker_sessions || taskItem?.work_logs;

    if (Array.isArray(workerSessions) && workerSessions.length > 0) {
      workerSessions.forEach((session: any, sIdx: number) => {
        const rawStatus = String(session?.status || taskItem?.status || '').toUpperCase();
        const hasEndTime = !!(
          session?.timeEnd ||
          session?.ended_at ||
          session?.completed_at ||
          session?.end_time ||
          session?.finish_time
        );
        const isDone = ['DONE', 'COMPLETED', 'SELESAI'].includes(rawStatus) || hasEndTime;

        if (isDone) {
          sessionList.push({
            ...taskItem,
            ...session,
            id: `session_${taskItem.id || idx}_${session.id || sIdx}`,
            parent_item: taskItem,
          });
        }
      });
    } else {
      const rawStatus = String(taskItem?.status || '').toUpperCase();
      const hasEndTime = !!(
        taskItem?.timeEnd ||
        taskItem?.ended_at ||
        taskItem?.completed_at ||
        taskItem?.end_time ||
        taskItem?.finish_time
      );
      const isDone = ['DONE', 'COMPLETED', 'SELESAI'].includes(rawStatus) || hasEndTime;

      if (isDone) {
        sessionList.push({ ...taskItem, id: `session_${taskItem.id || idx}` });
      }
    }
  });

  return sessionList;
};

export const extractHistoryData = (res: any): TaskSession[] => {
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
      historyLogs.push({ ...taskItem, id: `history_${taskItem.id || idx}` });
    }
  });

  return historyLogs;
};