import Header from '@/components/ui/Header';

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">{children}</div>
      </div>
    );
  }