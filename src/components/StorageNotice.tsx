import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { getPersistenceStatus, retryPendingWrites, subscribePersistence } from '../utils/persistence'

export default function StorageNotice() {
  const status = useSyncExternalStore(subscribePersistence, getPersistenceStatus, getPersistenceStatus)
  if (status.available) return null
  return (
    <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 mb-4">
      <p>{status.message}</p>
      <div className="mt-2 flex gap-4 font-semibold">
        <Link to="/settings" className="underline">导出学习备份</Link>
        {status.pendingKeys.length > 0 && <button onClick={retryPendingWrites} className="underline">重试保存</button>}
      </div>
    </div>
  )
}
