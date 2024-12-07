'use client';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useEffect, useRef, useState } from 'react';
import Wrapper from '../Wrapper';

const page = () => {
  const { isConnected, socket } = useWebSocket();
  const [logs, setLogs] = useState<any[]>([]);
  const [paused, setPaused] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSocketMessage = (event: MessageEvent) => {
      const newLog = JSON.parse(event.data);

      // Ensure it's a log message and add to the logs state
      if (newLog.type === 'log_entry') {
        setLogs((prevLogs) => [newLog, ...prevLogs]); // Add new log to the top
      }
    };

    if (socket) {
      socket.onmessage = handleSocketMessage;
    }

    return () => {
      if (socket) socket.onmessage = null;
    };
  }, [socket, isConnected]);

  // Auto-scroll to top of logs container (if not paused)
  useEffect(() => {
    if (!paused && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, paused]);
  return (
    <Wrapper>
      <div>
        {/* Pause/Resume Button */}
        {/* <button
        onClick={() => setPaused(!paused)}
        className='mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'>
        {paused ? 'Resume' : 'Pause'} Auto-Scroll
      </button> */}

        {/* Log Container */}
        <div ref={logContainerRef} className='h-[calc(100dvh-12rem)] overflow-y-auto bg-gray-900 text-white p-4 rounded shadow-md'>
          <div className='flex justify-end flex-grow'>
            <i className={`fa-solid fa-server text-xl absolute ${isConnected ? 'text-green-500' : 'text-red-500'}`}></i>
          </div>
          {logs.length === 0 ? (
            <p className='text-gray-500'>No logs available...</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 border-b border-gray-700 ${
                  log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                <p>
                  <span className='text-sm text-gray-400'>
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} |{' '}
                    {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </p>
                <p>{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
