"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  User,
  Lock,
  Package,
  PiggyBank,
  ShoppingCart,
  Heart,
  User2,
  LogOut,
  ChevronRight,
  FileTerminal,
  BookLock,
  HelpCircle,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoginOpen = useSelector(
    (state: RootState) => state.user.isLoginDialogOpen
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = {
    profilePicture: "",
    name: "fsdf",
    email: "sdfsdf@fgdfg",
  };

  const userPlaceholder = "";

  const handleLoginClick = () => {
    dispatch(toggleLoginDialog());
    setIsDropdownOpen(false);
  };

  const handleProtectionNavigation = (href: string) => {
    if (user) {
      router.push(href);
      setIsDropdownOpen(false);
    } else {
      dispatch(toggleLoginDialog());
      setIsDropdownOpen(false);
    }
  };
  const handleLogout = () => {};

  const menuItems = [
    ...(user
      ? [
          {
            href: "/account/profile",
            content: (
              <div className="flex space-x-4 items-center p-2 border-b">
                <Avatar className="w-12 h-12 rounded-full flex items-center justify-center">
                  {user?.profilePicture ? (
                    <AvatarImage alt="user-image"></AvatarImage>
                  ) : (
                    <AvatarFallback>{userPlaceholder}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-md">{user.name}</span>
                  <span className="font-semibold text-md">{user.email}</span>
                </div>
              </div>
            ),
          },
        ]
      : [
          {
            icon: <Lock className="h-4 w-4" />,
            label: "Login/Sign Up",
            onclick: handleLoginClick,
          },
        ]),
    {
      icon: <User className="h-4 w-4" />,
      label: "My Profile",
      onclick: () => handleProtectionNavigation("/account/profile"),
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: "My Orders",
      onclick: () => handleProtectionNavigation("/account/orders"),
    },
    {
      icon: <PiggyBank className="h-4 w-4" />,
      label: "My Sellings",
      onclick: () => handleProtectionNavigation("/account/selling-products"),
    },
    {
      icon: <ShoppingCart className="h-4 w-4" />,
      label: "My Cart",
      onclick: () => handleProtectionNavigation("/checkout/cart"),
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: "My Wishlist",
      onclick: () => handleProtectionNavigation("/account/wishlist"),
    },
    {
      icon: <User2 className="h-4 w-4" />,
      label: "About Us",
      href: "/about-us",
    },
    {
      icon: <FileTerminal className="h-4 w-4" />,
      label: "Terms & Use",
      href: "/terms-of-use",
    },
    {
      icon: <BookLock className="h-4 w-4" />,
      label: "Privacy Policy",
      href: "/privacy-policy",
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: "Help",
      href: "/how-it-works",
    },
    ...(user && [
      {
        icon: <LogOut className="h-4 w-4" />,
        label: "Logout",
        onclick: handleLogout,
      },
    ]),
  ];

  const MenuItems = ({ className = "" }) => (
    <div className={className}>
      {menuItems?.map((item, index) =>
        item?.href ? (
          <Link
            key={index}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-200"
            onClick={() => setIsDropdownOpen(false)}
          >
            {item.icon}
            <span>{item?.label}</span>
            {item?.content && <div className="mt-1">{item.content}</div>}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Link>
        ) : (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-200"
            onClick={item.onclick}
          >
            {item.icon}
            <span>{item?.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        )
      )}
    </div>
  );

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      {/* desktop nav */}
      <nav className="container w-[80%] mx-auto hidden lg:flex items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/web-logo.png"
            className="h-15 w-auto"
            alt="Logo"
            width={100}
            height={100}
          />
        </Link>
        <div className="flex flex-1 items-center justify-center max-w-xl px-4">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Bookname / Author / Subject / Publisher"
              className="w-full pr-10"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/book-sell"
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            <Button
              variant="secondary"
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            >
              Sell Used Book
            </Button>
          </Link>

          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-gray-900"
              >
                <Avatar className="w-8 h-8 rounded-full flex items-center justify-center">
                  {user?.profilePicture ? (
                    <AvatarImage alt="user-image"></AvatarImage>
                  ) : userPlaceholder ? (
                    <AvatarFallback>{userPlaceholder}</AvatarFallback>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Avatar>
                My Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-2">
              <MenuItems />
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/checkout/cart">
            <div className="relative ">
              <Button variant="ghost" className="retalive">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
              </Button>
              {user && (
                <span className="absolute top-1 left-4 transform translate-x-1/2 bg-red-500 text-white rounded-full px-1 text-xs">
                  4
                </span>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* mobile nav */}
      <nav className="container mx-auto flex lg:hidden items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/web-logo.png"
            className="h-6 w-20 md:h-10 md:w-auto"
            alt="Logo"
            width={100}
            height={100}
          />
        </Link>
        <div className="flex flex-1 items-center justify-center max-w-xl px-4">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search..."
              className="w-full pr-10"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Link href="/checkout/cart">
          <div className="relative ">
            <Button variant="ghost" className="relative">
              <ShoppingCart className="h-5 w-5 mr-2" />
            </Button>
            {user && (
              <span className="absolute top-1 left-4 transform translate-x-1/2 bg-red-500 text-white rounded-full px-1 text-xs">
                4
              </span>
            )}
          </div>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader>
              <SheetTitle className="sr-only"></SheetTitle>
            </SheetHeader>
            <div className="border-b p-4">
              <Link href="/">
                <Image
                  src="/images/web-logo.png"
                  className="h-10 w-auto"
                  alt="Logo"
                  width={150}
                  height={40}
                />
              </Link>
            </div>
            <MenuItems className="py-2 px-4" />
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
