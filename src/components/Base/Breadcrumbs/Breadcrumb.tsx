interface Breadcrumb {
  pageName: string;
  pageLink?: string;
}

const Breadcrumb = ({ crumbs }: { crumbs: Breadcrumb[] }) => {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <nav>
        <ol className='flex items-center gap-2'>
          <li>
            <a className='font-medium' href='/'>
              Dashboard
            </a>
          </li>
          {crumbs.map((crumb, key) => (
            <li key={key} className={`font-medium ${key == crumbs.length - 1 && 'text-primary'}`}>
              / <a href={crumb.pageLink}>{crumb.pageName}</a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
