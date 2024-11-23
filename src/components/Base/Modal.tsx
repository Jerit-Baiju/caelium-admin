interface ModalProps {
  state: boolean;
  onClose: () => void;
  title?: string;
  onConfirm: () => void;
}

const Modal = ({ state, onClose, title, onConfirm }: ModalProps) => {
  return (
    state && (
      <div className='overflow-y-auto flex overflow-x-hidden fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 h-screen max-h-full'>
        <div className='relative p-4 w-full max-w-md max-h-full'>
          <div className='relative dark:bg-neutral-700 bg-neutral-300 rounded-lg shadow'>
            <button
              type='button'
              className='absolute top-3 end-2.5 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-neutral-300'>
              <i className='fa-solid fa-xmark'></i>
              <span className='sr-only'>Close modal</span>
            </button>
            <div className='p-4 md:p-5 text-center'>
              <i className='fa-solid fa-circle-exclamation fa-fade text-yellow-500 dark:text-yellow-300 text-6xl my-4'></i>
              <h3 className='mb-5 text-lg font-normal'>{title}</h3>
              <button
                onClick={onConfirm}
                type='button'
                className='bg-red-500 text-white dark:hover:bg-red-800 hover:bg-red-600 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2'>
                Yes, I&apos;m sure
              </button>
              <button
                type='button'
                className='dark:bg-neutral-800 bg-neutral-500 text-white rounded-lg font-medium px-5 py-2.5 hover:bg-neutral-700'>
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
