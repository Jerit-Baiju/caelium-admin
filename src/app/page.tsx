'use client';
import Widgets from '@/components/Dashboard/Widgets';
import Wrapper from './Wrapper';
import LiveLogs from '@/components/Dashboard/LiveLogs';

export default function Home() {
  return (
    <Wrapper>
      <Widgets />
      <LiveLogs />
    </Wrapper>
  );
}
