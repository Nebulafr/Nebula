declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "react-toastify/dist/ReactToastify.css" {
  const content: any;
  export default content;
}
