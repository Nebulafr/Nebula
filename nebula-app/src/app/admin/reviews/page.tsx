"use client";

import React, { useState } from "react";
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

const reviews = [
  {
    author: {
      name: "Carlos Pavol",
      avatar: "https://i.pravatar.cc/40?u=carlos-pavol",
    },
    review:
      "Adrian was incredibly insightful and supportive. His real-world examples from BCG made complex concepts easy to understand. I left the session feeling more confident and inspired.",
    rating: 5,
    target: {
      type: "Coach",
      name: "Adrian Cucurella",
    },
    date: "2024-08-01",
    status: "Visible",
  },
  {
    author: {
      name: "Sarah K.",
      avatar: "https://i.pravatar.cc/40?u=sarah-k",
    },
    review:
      "A fantastic mentor. Adrian helped me navigate the complexities of a case interview and provided actionable feedback.",
    rating: 5,
    target: {
      type: "Program",
      name: "Consulting, Associate Level",
    },
    date: "2024-07-28",
    status: "Visible",
  },
  {
    author: {
      name: "Tom B.",
      avatar: "https://i.pravatar.cc/40?u=tom-b",
    },
    review:
      "Good insights, but I was hoping for more materials to review after the sessions. The live coaching was great, though.",
    rating: 4,
    target: {
      type: "Coach",
      name: "Adrian Cucurella",
    },
    date: "2024-07-15",
    status: "Pending",
  },
  {
    author: {
      name: "Li W.",
      avatar: "https://i.pravatar.cc/40?u=li-w",
    },
    review:
      "Highly recommend Adrian for anyone looking to break into consulting. His knowledge of the industry is immense.",
    rating: 5,
    target: {
      type: "Coach",
      name: "Adrian Cucurella",
    },
    date: "2024-06-20",
    status: "Hidden",
  },
];

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

  const filteredReviews = reviews.filter(
    (review) =>
      review.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.target.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredReviews.map((review, index) => (
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
              ))}
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
