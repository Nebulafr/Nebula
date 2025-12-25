"use client";

import React, { useState } from "react";
import { useAdminReviews } from "@/hooks";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  Star,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

export default function AdminReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: reviews = [], isLoading: loading } = useAdminReviews({
    search: debouncedSearch || undefined,
  });

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Transform reviews to match the table interface
  const transformedReviews = reviews.map((review: any) => ({
    id: review.id,
    author: {
      name: review.reviewer.fullName || review.reviewer.email,
      avatar: review.reviewer.avatarUrl,
    },
    review: review.content,
    rating: review.rating,
    target: {
      type:
        review.targetType === "PROGRAM"
          ? "Program"
          : review.targetType === "COACH"
          ? "Coach"
          : "Session",
      name: review.program?.title || review.reviewee?.fullName || "Unknown",
    },
    date: new Date(review.createdAt).toLocaleDateString(),
    status: review.isPublic ? "Visible" : "Hidden",
  }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reviews, authors, or targets..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead className="w-[40%]">Review</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transformedReviews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No reviews found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                transformedReviews.map((review: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.author.avatar} />
                          <AvatarFallback>
                            {review.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{review.author.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="truncate-multiline">{review.review}</p>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.target.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {review.target.type}
                      </div>
                    </TableCell>
                    <TableCell>{review.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          review.status === "Visible"
                            ? "secondary"
                            : review.status === "Hidden"
                            ? "outline"
                            : "destructive"
                        }
                        className={
                          review.status === "Visible"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {review.status !== "Visible" && (
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> Approve & Show
                            </DropdownMenuItem>
                          )}
                          {review.status === "Visible" && (
                            <DropdownMenuItem>
                              <EyeOff className="mr-2 h-4 w-4" /> Hide Review
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <style jsx>{`
        .truncate-multiline {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
