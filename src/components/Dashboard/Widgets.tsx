import useAxios from '@/hooks/useAxios';
import { useEffect, useState } from 'react';
import InfoWidget from '../Base/InfoWidget';

const Widgets = () => {
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<any>({});
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const response = await api.get('/dash/stats/');
        setWidgets(response.data);
      } catch (error) {
        console.error('Error fetching widgets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWidgets();
  }, []);

  const widgetData = [
    {
      color: 'bg-teal-400',
      growthRate: 0,
      icon: 'fa-people-group',
      title: 'Users',
      value: widgets['users'] ?? 0,
    },
    {
      color: 'bg-blue-500',
      growthRate: 0,
      icon: 'fa-message',
      title: 'Messages',
      value: widgets['messages'] ?? 0,
    },
    {
      color: 'bg-green-500',
      growthRate: 0,
      icon: 'fa-users-rectangle',
      title: 'Chats',
      value: widgets['chats'] ?? 0,
    },
    {
      color: 'bg-green-400',
      growthRate: 0,
      icon: 'fa-feather',
      title: 'Crafts',
      value: widgets['crafts'] ?? 0,
    },
  ];
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
      {widgetData.map((widget, index) => (
        <InfoWidget
          key={index}
          widget={{
            color: widget.color,
            growthRate: widget.growthRate,
            icon: <i className={`${widget.icon} fa-solid text-2xl text-white`} />,
            title: widget.title,
            value: widget.value,
          }}
        />
      ))}
    </div>
  );
};

export default Widgets;
