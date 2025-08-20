"use client";

import NoData from "@/app/components/NoData";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BookLoader from "@/lib/BookLoader";
import { BookDetails } from "@/lib/types/type";
import {
  useAddToCartMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/api";
import { addToCart } from "@/store/slice/cartSlice";
import { removeFromWishlistAction } from "@/store/slice/wishlistSlice";
import { RootState } from "@/store/store";
import { Check, Heart, Loader2, ShoppingCart, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [addToCartMutation] = useAddToCartMutation();
  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();
  const [isAddToCart, setIsAddToCart] = useState(false);
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const cart = useSelector((state: RootState) => state.cart.items);
  const { data: wishlistData, isLoading } = useGetWishlistQuery({});
  const [wishlistItems, setWishlistItems] = useState<BookDetails[]>([]);

  useEffect(() => {
    if (wishlistData?.success) {
      setWishlistItems(wishlistData?.data?.products);
    }
  }, [wishlistData]);

  const handleAddToCart = async (productId: string) => {
    setIsAddToCart(true);
    try {
      const result = await addToCartMutation({
        productId,
        quantity: 1,
      }).unwrap();
      if (result.success && result.data) {
        dispatch(addToCart(result.data));
        toast.success(result.message || "added to cart succesfully");
      } else {
        throw new Error(result.message || "failed to add to cart");
      }
    } catch (error: any) {
      const errormessage = error?.data?.message;
      toast.error(errormessage);
    } finally {
      setIsAddToCart(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const isWishlist = wishlist.some((item) =>
        item.products.includes(productId)
      );
      if (isWishlist) {
        const result = await removeFromWishlistMutation(productId).unwrap();
        if (result.success) {
          dispatch(removeFromWishlistAction(productId));
          toast.success(result.message || "Removed from wishlist");
        } else {
          throw new Error(result.message || "failed to remove from wishlist");
        }
      }
    } catch (error: any) {
      const errormessage = error?.data?.message;
      toast.error(errormessage || "failed to remove from wishlist");
    }
  };

  const isItemInCart = (productId: string) => {
    return cart.some((cartItem) => cartItem.product._id === productId);
  };

  if (isLoading) {
    return <BookLoader />;
  }

  if (!wishlistItems.length)
    return (
      <NoData
        message="Your wishlist is empty."
        description="Looks like you haven't added any items to your wishlist yet. 
             Browse our collection and save your favorites!"
        buttonText="Browse Books"
        imageUrl="/images/wishlist.webp"
        onClick={() => router.push("/books")}
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-red-600" />
        <h3 className="text-2xl font-bold">My WishList</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>₹{item.finalPrice.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                className="w-full aspect-square object-cover"
                src={item.images[0]}
                alt={item.title}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleWishlist(item._id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              {isItemInCart(item?._id) ? (
                <>
                  <Button
                    disabled
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Item in cart
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleAddToCart(item?._id)}
                  >
                    {isAddToCart ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default page;
