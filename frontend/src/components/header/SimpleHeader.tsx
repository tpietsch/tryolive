import { Link } from "react-router";
import UserDropdown from "./UserDropdown";

interface SimpleHeaderProps {
  pageTitle?: string;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({ pageTitle = "Dog Breeds" }) => {
  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-99999">
      <div className="flex flex-col items-center justify-between w-full xl:flex-row xl:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 xl:justify-between xl:border-b-0 xl:px-0 lg:py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <img
                className="h-8"
                src="https://cdn.prod.website-files.com/67369d0755824ba084a36d16/6744fb65148178040a5c0221_Small%20-%20Website%20olive%20logo%2010.24%20(1).png"
                alt="Olive Logo"
              />
            </Link>
            <div className="hidden h-6 w-px bg-gray-200 sm:block"></div>
            <h1 className="hidden sm:block text-lg font-semibold text-gray-900">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 2xsm:gap-3">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
