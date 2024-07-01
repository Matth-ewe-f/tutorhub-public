import * as React from "react";
import { Bookmark } from "lucide-react";

interface BookmarkIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ className, ...props }) => {
  return (
    <Bookmark
      className={className}
      {...props}
    />
  );
};

export default BookmarkIcon;