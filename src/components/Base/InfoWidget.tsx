import { InfoWidgetProps } from '@/types/infoWidget';

const InfoWidget = ({ widget }: { widget: InfoWidgetProps }) => {
  return (
    <>
      <div className='flex items-center justify-between rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark'>
        <div className={'flex h-14.5 w-14.5 items-center justify-center rounded-full' + ` ${widget.color}`}>{widget.icon}</div>
        <div className='flex flex-col items-center justify-between'>
          <h4 className='text-heading-6 font-bold text-dark dark:text-white'>{widget.value}</h4>
          <div>
            <span className='font-medium'>{widget.title}</span>
          </div>
        </div>
        {widget.growthRate !== 0 && (
          <span className={`flex items-center gap-1.5 text-body-sm font-medium ${widget.growthRate > 0 ? 'text-green' : 'text-red'}`}>
            {widget.growthRate}%
            {widget.growthRate > 0 ? (
              <svg className='fill-current' width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M4.35716 2.3925L0.908974 5.745L5.0443e-07 4.86125L5 -5.1656e-07L10 4.86125L9.09103 5.745L5.64284 2.3925L5.64284 10L4.35716 10L4.35716 2.3925Z'
                  fill=''
                />
              </svg>
            ) : (
              <svg className='fill-current' width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M5.64284 7.6075L9.09102 4.255L10 5.13875L5 10L-8.98488e-07 5.13875L0.908973 4.255L4.35716 7.6075L4.35716 7.6183e-07L5.64284 9.86625e-07L5.64284 7.6075Z'
                  fill=''
                />
              </svg>
            )}
          </span>
        )}
        {widget.growthRate == 0 && <div></div>}
      </div>
    </>
  );
};

export default InfoWidget;
