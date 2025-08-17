import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem as CartItemType } from "@/lib/types/type";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CartItemProps {
  items: CartItemType[];
  onRemoveItem: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: { products: string[] }[];
}

const CartItem: React.FC<CartItemProps> = ({
  items,
  onRemoveItem,
  onToggleWishlist,
  wishlist,
}) => {
  return (
    <ScrollArea className="h-[400px] pr-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex flex-col md:flex-row gap-4 py-4 border-b last:border-0"
        >
          <Link href={`/books/${item.product._id}`}>
            <Image
              src={item?.product?.images?.[0] || "/logo.png"}
              alt={item?.product?.title || "Book Image"}
              width={80}
              height={100}
              className="object-contain w-60 md:w-48 rounded-xl"
            />
          </Link>
        </div>
      ))}
    </ScrollArea>
  );
};

export default CartItem;
