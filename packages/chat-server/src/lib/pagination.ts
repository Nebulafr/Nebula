export const calculatePagination = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const hasMoreMessages = (messagesLength: number, limit: number): boolean => {
  return messagesLength === limit;
};
