"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { filters } from "@/lib/Constant";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import BookLoader from "@/lib/BookLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Pagination from "../components/Pagination";
import NoData from "../components/NoData";
import { useRouter } from "next/navigation";
import { useGetProductsQuery } from "@/store/api";
import { BookDetails } from "@/lib/types/type";

const page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");
  const bookPerPage = 6;
  const {data:apiResponse = {}, isLoading} = useGetProductsQuery({});
  const router = useRouter();
  const [books, setBooks] = useState<BookDetails[]>([]);

  const searchTerms = new URLSearchParams(window.location.search).get("search") || "";

  useEffect(() => {
    if(apiResponse.success){
      setBooks(apiResponse.data)
    }
  }, [apiResponse] )

  const toggleFilter = (section: string, item: string) => {
  const updateFilter = (prev: string[]) => 
  prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
    

    switch (section) {
      case "condition":
        setSelectedCondition(updateFilter);
        break;

      case "classType":
        setSelectedType(updateFilter);
        break;

      case "category":
        setSelectedCategory(updateFilter);
        break;
    }
    setCurrentPage(1);
  };

  const filterBooks = books.filter((book) => {
    const conditionMatch =
      selectedCondition.length === 0 ||
      selectedCondition
        .map((cond) => cond.toLowerCase())
        .includes(book.condition.toLocaleLowerCase());
    const typeMatch =
      selectedType.length === 0 ||
      selectedType
        .map((cond) => cond.toLowerCase())
        .includes(book.classType.toLocaleLowerCase());
    const categoryMatch =
      selectedCategory.length === 0 ||
      selectedCategory
        .map((cond) => cond.toLowerCase())
        .includes(book.category.toLocaleLowerCase());
    const searchMatch = searchTerms ? book.title.toLowerCase().includes(searchTerms.toLowerCase())
    || book.author.toLowerCase().includes(searchTerms.toLowerCase())
    || book.category.toLowerCase().includes(searchTerms.toLowerCase())
    || book.subject.toLowerCase().includes(searchTerms.toLowerCase())
    : true;

    return conditionMatch && typeMatch && categoryMatch && searchMatch;
  });

  const sortedBooks = [...filterBooks].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "price-low":
        return a.finalPrice - b.finalPrice;
      case "price-high":
        return b.finalPrice - a.finalPrice;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / bookPerPage);

  const paginatedBooks = sortedBooks.slice(
    (currentPage - 1) * bookPerPage,
    currentPage * bookPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          <span>Books</span>
        </nav>
        <h1 className="mb-8 text-3xl font-bold">
          {" "}
          Find from over 100+ of used books online
        </h1>
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="space-y-6">
            <Accordion
              type="multiple"
              className="bg-white p-6 border rounded-lg"
            >
              {Object.entries(filters).map(([key, values]) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="text-lg font-semibold text-blue-500">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 space-y-2">
                      {values.map((value) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={value}
                            checked={
                              key === "condition"
                                ? selectedCondition.includes(value)
                                : key === "classType"
                                ? selectedType.includes(value)
                                : selectedCategory.includes(value)
                            }
                            onChange={() => toggleFilter(key, value)}
                          />
                          <label
                            htmlFor={value}
                            className="text-sm font-medium leading-none"
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <BookLoader />
            ) : paginatedBooks.length ? (
              <>
                <div className="flex justify-between">
                  <div className="mb-8 text-xl font-semibold">
                    Buy second hand books, Used books online in india
                  </div>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">oldest First</SelectItem>
                      <SelectItem value="price-low">
                        Price: low to high
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: high to low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedBooks.map((book) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-wrap"
                    >
                      <Card className="w-full  group relative overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-2xl bg-white border-0">
                        <CardContent className="p-0">
                          <Link href={`/books/${book._id}`}>
                            <div className="relative">
                              <Image
                                src={
                                  book.images && book.images[0]
                                    ? book.images[0]
                                    : "/window.svg"
                                }
                                alt={book.title}
                                width={400}
                                height={300}
                                className="h-[250px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute left-0 top-0 z-10 flex flex-col gap-2 p-2">
                                {calculateDiscount(
                                  book.price,
                                  book.finalPrice
                                ) > 0 && (
                                  <Badge className="bg-orange-600/90 text-white hover:bg-orange-700">
                                    {calculateDiscount(
                                      book.price,
                                      book.finalPrice
                                    )}
                                    % Off
                                  </Badge>
                                )}
                              </div>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm transition-opacity duration-300 hover:bg-white group-hover:opacity-100"
                              >
                                <Heart className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-orange-500 line-clamp-2">
                                  {book.title}
                                </h3>
                              </div>
                              <p className="text-sm text-zinc-400">
                                {book.author}
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold to-black">
                                  ₹{book.finalPrice}
                                </span>
                                {book.price && (
                                  <span className="text-sm text-zinc-500 line-through">
                                    ₹{book.price}
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-xs text-zinc-400">
                                <span>{formateDate(book.createdAt)}</span>
                                <span>{book.condition}</span>
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <NoData
                imageUrl="/images/no-book.jpg"
                message="No books available please try later."
                description="Try adjusting your filters or search criteria to find what you're looking for."
                onClick={() => router.push("/book-sell")}
                buttonText="Shell Your First Book"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
