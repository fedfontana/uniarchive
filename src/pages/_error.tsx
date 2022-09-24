import Link from "next/link";

const ErrorPage = ({ statusCode }: { statusCode: number }) => {
  return (
    <div className="flex flex-col gap-4 w-full h-full items-center mt-24 md:mt-32">
      <h2 className="text-4xl font-semibold"> {statusCode === 404 ? "Resource not found" : "Server error"}</h2>
      <Link href="/" passHref>
        <a className="text-xl text-blue-500 hover:underline">
          Go back to the home page
        </a>
      </Link>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }: any) => {
  //console.log("ERROR CUSTOM LOG: ", err);
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
