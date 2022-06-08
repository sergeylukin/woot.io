import React from "react";
import { AwesomeLink } from "../components/AwesomeLink";
import { getSession } from "next-auth/react";
import { gql, useQuery } from "@apollo/client";

export const FavoritesQuery = gql`
  query {
    bookmarks {
      title
      id
      url
      imageUrl
      description
      category
    }
  }
`;

const Favorites = () => {
  const { data, loading, error } = useQuery(FavoritesQuery);
  if (error) return <p>Oops! SOmething went wrong {error}</p>;
  return (
    <div className="mx-auto my-20 max-w-5xl px-10">
      <h1 className="text-3xl font-medium my-5">My Favorites</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.bookmarks.length === 0 ? (
            <p className="text-2xl font-medium">
              You haven't bookmarked any links yet 👀
            </p>
          ) : (
            data.bookmarks.map((link) => (
              <div key={link.id}>
                <AwesomeLink
                  title={link.title}
                  description={link.description}
                  category={link.category}
                  imageUrl={link.imageUrl}
                  url={link.url}
                  id={link.id}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }
};
