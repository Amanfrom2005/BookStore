"use client";

import CartItem from "@/app/components/CartItems";
import NoData from "@/app/components/NoData";
import PriceDetails from "@/app/components/PriceDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAddToWishlistMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useRemoveFromWishlistMutation,
} from "@/store/api";
import { setCart } from "@/store/slice/cartSlice";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import { addToWishlistAction, removeFromWishlistAction } from "@/store/slice/wishlistSlice";
import { RootState } from "@/store/store";
import { ChevronRight, CreditCard, MapPin, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { orderId, step } = useSelector((state: RootState) => state.checkout);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(user?._id);
  const [removeFromCartMutation] = useRemoveFromCartMutation();
  const [addToWishlistMutation] = useAddToWishlistMutation();
  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const cart = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if(cartData?.success && cartData?.data){
      dispatch(setCart(cartData.data))
    }
  }, [cartData, dispatch])

  const handleRemoveItem = async (productId: string) => {
    try {
      const result = await removeFromCartMutation(productId).unwrap();
      if(result.success && result.data){
        dispatch(setCart(result.data));
        toast.success(result.message || "Removed from Cart Succesfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("failed to remove from cart");
    }
  }

  const handleAddToWishlist = async (productId: string) => {
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
      } else {
        const result = await addToWishlistMutation(productId).unwrap();
        if (result.success) {
          dispatch(addToWishlistAction(result.data));
          toast.success(result.message || "Added to wishlist");
        } else {
          throw new Error(result.message || "failed to add to wishlist");
        }
      }
    } catch (error: any) {
      const errormessage = error?.data?.message;
      toast.error(errormessage || "failed to remove from wishlist");
    }
  };

   const handleLoginClick = () => {
      dispatch(toggleLoginDialog());
    };

  if (!user) {
    return (
      <NoData
        message="Please log in to access your cart."
        description="You need to be logged in to view your cart and checkout."
        buttonText="Login"
        imageUrl="/images/login.jpg"
        onClick={handleLoginClick}
      />
    );
  }

  if (cart.items.length === 0) {
    return (
      <NoData
        message="Your cart is empty."
        description="Looks like you haven't added any items yet. 
        Explore our collection and find something you love!"
        buttonText="Browse Books"
        imageUrl="/images/cart.webp" 
        onClick={() => router.push('/books')}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="bg-gray-100 py-4 px-6 mb-8">
          <div className="container mx-auto flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800 ">
              {cart.items.length} 
              {cart.items.length === 1 ? ' item' : ' items'}
              {" "}
              in your cart
            </span>
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-3 text-xs ${step === "cart" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium hidden md:inline">Cart</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />

                <div className={`rounded-lg p-3 text-xs ${step === "address" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium hidden md:inline">Address</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />

                <div className={`rounded-lg p-3 text-xs ${step === "payment" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium hidden md:inline">Payment</span>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Order summary</CardTitle>
                    <CardDescription>Review your order details before proceeding to payment.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CartItem 
                      items={cart.items}
                      onRemoveItem={handleRemoveItem}
                      onToggleWishlist={handleAddToWishlist}
                      wishlist={wishlist}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="">
                <PriceDetails />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
