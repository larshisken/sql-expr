export type JsonOperation =
  | { type: "->"; key: string } // -> 'key'
  | { type: "->"; index: number } // -> index
  | { type: "->>"; key: string } // ->> 'key'
  | { type: "->>"; index: number } // ->> index
  | { type: "#>"; path: (string | number)[] } // #> '{key1,key2,index}'
  | { type: "#>>"; path: (string | number)[] }; // #>> '{key1,key2,index}'

export type ColumnSpec = {
  readonly table: string;
  readonly column: string;
  readonly jsonOperations?: JsonOperation[];
};

export type QuerySchema = {
  readonly columns: Record<string, ColumnSpec>;
  readonly allowedFunctions?: string[];
};
