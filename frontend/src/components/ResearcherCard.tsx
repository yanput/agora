import React from "react";
import { Link } from "react-router-dom";

interface Researcher {
  id: string;
  name: string;
  description: string;
}

interface Props {
  researcher: Researcher;
}

export function ResearcherCard({ researcher }: Props) {
  return (
      <Link
          to={`/researcher/${researcher.id}`}
          className="block border p-4 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <h3 className="text-lg font-semibold">{researcher.name}</h3>
        <p>{researcher.description}</p>
      </Link>
  );
}