"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  ShoppingCart,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookDetails } from "@/lib/types/type";
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetProductByIdQuery,
  useRemoveFromWishlistMutation,
} from "@/store/api";
import BookLoader from "@/lib/BookLoader";
import NoData from "@/app/components/NoData";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart } from "@/store/slice/cartSlice";
import toast from "react-hot-toast";
import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/store/slice/wishlistSlice";
import { ShareButton } from "@/app/components/Share";

const page = () => {
  const params = useParams();
  const id = params.id;
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    data: apiResponse = {},
    isLoading,
    isError,
  } = useGetProductByIdQuery(id);
  const [isAddToCart, setIsAddToCart] = useState(false);
  const [book, setBook] = useState<BookDetails | null>(null);
  const [addToCartMutation] = useAddToCartMutation();
  const [addToWishlistMutation] = useAddToWishlistMutation();
  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);

  useEffect(() => {
    if (apiResponse.success) {
      setBook(apiResponse.data);
    }
  }, [apiResponse]);

  const handleAddToCart = async () => {
    if (book) {
      setIsAddToCart(true);
      try {
        const result = await addToCartMutation({
          productId: book?._id,
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
    }
  };
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
  const bookImage = book?.images || [];

  if (isLoading) {
    return <BookLoader />;
  }

  if (!book || isError) {
    return (
      <div className="my-10 max-w-3xl justify-center mx-auto">
        <NoData
          imageUrl="/images/no-book.jpg"
          message="Loading...."
          description="Wait, we are fetching book details"
          onClick={() => router.push("/book-sell")}
          buttonText="Sell Your First Book"
        />
      </div>
    );
  }

  const calculateDiscount = (price: number, finalPrice: number): number => {
    if (price > finalPrice && price > 0) {
      return Math.round(((price - finalPrice) / price) * 100);
    }
    return 0;
  };

  const formateDate = (dateString: Date) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            {" "}
            Home {""}
          </Link>
          <span>/</span>
          <Link href="/books" className="text-primary hover:underline">
            Books
          </Link>
          <span>/</span>
          <span className="text-gray-600">{book.category}</span>
          <span>/</span>
          <span className="text-gray-600">{book.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="relative h-[400px] overflow-hidden rounded-lg border bg-white shadow-md">
              <Image
                src={bookImage[selectedImage]}
                alt={book.title}
                fill
                className="object-contain"
              />
              {calculateDiscount(book.price, book.finalPrice) > 0 && (
                <span className="absolute left-0 top-2 rounded-r-lg px-2 py-1 text-xs font-medium bg-orange-600/90 text-white hover:bg-orange-700">
                  {calculateDiscount(book.price, book.finalPrice)}% Off
                </span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {bookImage.map((images, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-300 ${
                    selectedImage === index
                      ? "ring-2 ring-primary scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <Image
                    src={images}
                    alt={`${book.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* book details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{book.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Posted {formateDate(book.createdAt)}{" "}
                </p>
              </div>
              <div className="flex gap-2">
                <ShareButton
                  url={`${window.location.origin}/books/${book._id}`}
                  title={`check out this book : ${book.title}`}
                  text={`I found this interesting book on bookKart : ${book.title}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToWishlist(book._id)}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${
                      wishlist.some((w) => w.products.includes(book._id))
                        ? "fill-red-500"
                        : ""
                    }`}
                  />
                  <span className="hidden md:inline">
                    {wishlist.some((w) => w.products.includes(book._id))
                      ? "Remove"
                      : "Add"}
                  </span>
                </Button>
              </div>
            </div>

            {/* price */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">₹{book.finalPrice}</span>
                {book.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{book.price}
                  </span>
                )}

                <Badge variant="secondary" className="text-green-600">
                  Shipping Available
                </Badge>
              </div>

              <Button
                className="w-60 py-6 bg-blue-700"
                onClick={handleAddToCart}
                disabled={isAddToCart}
              >
                {isAddToCart ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Adding to cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 w-5 h-5" />
                    Buy now
                  </>
                )}
              </Button>

              <Card className="border border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Book Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-medium text-muted-foreground">
                      Subject/Title
                    </div>
                    <div>{book.subject}</div>
                    <div className="font-medium text-muted-foreground">
                      Course
                    </div>
                    <div>{book.classType}</div>
                    <div className="font-medium text-muted-foreground">
                      Category
                    </div>
                    <div>{book.category}</div>
                    <div className="font-medium text-muted-foreground">
                      auther
                    </div>
                    <div>{book.author}</div>
                    <div className="font-medium text-muted-foreground">
                      eddition
                    </div>
                    <div>{book.edition}</div>
                    <div className="font-medium text-muted-foreground">
                      condition
                    </div>
                    <div>{book.condition}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* description */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{book.description}</p>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Our Comunity</h3>
                <p className="text-muted-foreground">
                  We're not just another shopping website where you buy from
                  professional sellers - we are a vibrant community of students,
                  book lovers across India who deliver happiness to each other!
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>Ad Id: {book._id}</div>
                <div>Posted: {formateDate(book.createdAt)}</div>
              </div>
            </CardContent>
          </Card>

          {/* book seller ditels */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Sold by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-300 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {book.seller?.name || "Unknown Seller"}
                      </span>
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {book.seller?.addresses &&
                      book.seller.addresses.length > 0
                        ? book.seller.addresses.city
                        : "Unknown Location"}
                    </div>
                  </div>
                </div>
              </div>
              {book.seller?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                  <span className="">Contact : {book.seller.phoneNumber} </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* how it works */}
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">How does it works?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "Step 1",
                title: "Seller posts an Ad",
                description:
                  "Seller posts an ad on book kart to sell their used books.",
                image: { src: "/icons/ads.png", alt: "Post Ad" },
              },
              {
                step: "Step 2",
                title: "Buyer Pays Online",
                description:
                  "Buyer makes an online payment to book kart to buy those books.",
                image: { src: "/icons/pay_online.png", alt: "Payment" },
              },
              {
                step: "Step 3",
                title: "Seller ships the books",
                description: "Seller then ships the books to the buyer",
                image: { src: "/icons/fast-delivery.png", alt: "Shipping" },
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-amber-50 to-amber-100 border-none"
              >
                <CardHeader>
                  <Badge className="w-fit mb-2">{item.step}</Badge>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;
