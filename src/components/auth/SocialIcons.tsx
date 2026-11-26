import type { SVGProps } from "react";

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 48 48"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        fill="#FFFFFF"
        d="M7.68 9.95v7.63H5.14V9.95h2.54zm.17-2.36a1.47 1.47 0 1 1-2.94 0 1.47 1.47 0 0 1 2.94 0zM18.86 13.38v4.2h-2.53v-3.92c0-.98-.35-1.65-1.23-1.65-.67 0-1.07.45-1.25.89-.06.16-.08.38-.08.6v4.08H11.24s.03-6.62 0-7.31h2.53v1.04c-.01.01-.02.02-.02.03h.02v-.03c.34-.52.94-1.26 2.28-1.26 1.67 0 2.81 1.09 2.81 3.33z"
      />
    </svg>
  );
}
