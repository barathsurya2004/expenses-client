import React from 'react';
import { WishlistGridWidget } from '../components/widgets/WishlistGridWidget';

const WishlistPage: React.FC = () => {
  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24 md:pb-12">
      <WishlistGridWidget />
    </div>
  );
};

export default WishlistPage;
