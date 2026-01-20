/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'epubjs' {
  export interface Book {
    ready: Promise<void>;
    loaded: {
      metadata: Promise<{
        title: string;
        creator: string;
        description?: string;
        pubdate?: string;
        publisher?: string;
        identifier?: string;
        language?: string;
        rights?: string;
        modified_date?: string;
      }>;
      spine: Promise<any>;
      cover: Promise<string>;
    };
    spine: {
      items: Array<{
        href: string;
        idref: string;
        index: number;
      }>;
    };
    navigation: {
      toc: Array<{
        href: string;
        label: string;
        id?: string;
      }>;
    };
    coverUrl(): Promise<string | null>;
    section(target: string | number): Section | null;
    load: (path: string) => Promise<Document | string>;
  }

  export interface Section {
    load(loader: (path: string) => Promise<Document | string>): Promise<Document | string>;
  }

  function ePub(data: ArrayBuffer | string): Book;
  export default ePub;
}
