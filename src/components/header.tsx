import { DarkModeToggle } from "./dark-mode-toggle";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h3 className="p-5 scroll-m-20 text-2xl font-semibold tracking-tight">
          AZQUERYSUCKS
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
