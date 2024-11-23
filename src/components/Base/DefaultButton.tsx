import Link from "next/link";
import React, { MouseEventHandler } from "react";

interface ButtonPropTypes {
  label: string;
  link: string;
  customClasses: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler;
}

const DefaultButton = ({
  label,
  link,
  customClasses,
  children,
  onClick
}: ButtonPropTypes) => {
  return (
    <>
      <Link
      onClick={onClick}
        className={`inline-flex items-center justify-center gap-2.5 text-center font-medium hover:bg-opacity-90 ${customClasses}`}
        href={link}
      >
        {children}
        {label}
      </Link>
    </>
  );
};

export default DefaultButton;
