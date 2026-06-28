import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork, UserProfile, Order } from '../types';

interface CheckoutViewProps {
  cart: Artwork[];
  currentUser: UserProfile | null;
  onRemoveFromCart: (artworkId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (orderData: Partial<Order>) => Promise<void>;
  onNavigate: (view: 'gallery' | 'market' | 'profile' | 'checkout') => void;
}

export default function CheckoutView({
  cart,
  currentUser,
  onRemoveFromCart,
  onClearCart,
  onSubmitOrder,
  onNavigate,
}: CheckoutViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Cart review, 2: Checkout form, 3: Completed Tracking Receipt
  const [paymentMethod, setPaymentMethod] = useState<'Connected Wallet' | 'Credit Card'>('Connected Wallet');

  // Form states
  const [buyerName, setBuyerName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Elena Voss');
  const [buyerEmail, setBuyerEmail] = useState(currentUser ? currentUser.email : 'elena@voss.com');
  const [walletAddr, setWalletAddr] = useState('0x8a2f3a9d7b4e5c1f91c3d0b2a5e8c1f90a1b2c3d');
  const [cardNo, setCardNo] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('099');

  // Simulated order result receipt
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [simulatedTransitStep, setSimulatedTransitStep] = useState<'pending' | 'confirmed' | 'delivered'>('confirmed');

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const processingFee = cart.length > 0 ? 15 : 0;
  const totalAmount = subtotal + processingFee;
  const currencyUnit = cart[0]?.priceUnit || '€';

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderPayload: Partial<Order> = {
      name: buyerName,
      email: buyerEmail,
      walletAddress: paymentMethod === 'Connected Wallet' ? walletAddr : '0xCreditCardLinked...',
      paymentMethod,
      items: cart.map((item) => ({
        artworkId: item.id,
        title: item.title,
        artist: item.artist,
        price: item.price,
        priceUnit: item.priceUnit,
        imageUrl: item.imageUrl,
      })),
      subtotal,
      processingFee,
      total: totalAmount,
    };

    try {
      // Send order to backend database
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const orderResult = await res.json();
        setCreatedOrder(orderResult);
        setSimulatedTransitStep('confirmed');
        onClearCart();
        setStep(3); // Go directly to completion tracking screen
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  // Accelerate / Simulate Order Tracking status update locally
  const handleSimulateDispatch = () => {
    if (simulatedTransitStep === 'confirmed') {
      setSimulatedTransitStep('delivered');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-12">
      {/* Dynamic Progress indicator */}
      <section className="flex justify-center items-center gap-4 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? 'bg-[#121212] text-[#fbf9f8]' : 'bg-[#efeded] text-[#5e5e5b]'
            }`}
          >
            1
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#121212]">Cart</span>
        </div>
        <div className="flex-1 h-px bg-[#121212]/10"></div>
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2 ? 'bg-[#121212] text-[#fbf9f8]' : 'bg-[#efeded] text-[#5e5e5b]'
            }`}
          >
            2
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-[#121212]' : 'text-[#5e5e5b]'}`}>
            Secured purchase
          </span>
        </div>
        <div className="flex-1 h-px bg-[#121212]/10"></div>
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 3 ? 'bg-[#121212] text-[#fbf9f8]' : 'bg-[#efeded] text-[#5e5e5b]'
            }`}
          >
            3
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 3 ? 'text-[#121212]' : 'text-[#5e5e5b]'}`}>
            Tracking
          </span>
        </div>
      </section>

      {/* STEP 1: Sovereign Cart items list */}
      {step === 1 && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cart review */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#121212]">Your Sovereign Bag</h2>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#121212]/5 space-y-6">
                <span className="material-symbols-outlined text-4xl text-[#5e5e5b]/30">shopping_bag</span>
                <p className="text-sm font-bold uppercase tracking-widest text-[#5e5e5b]">
                  Your cart is currently empty.
                </p>
                <button
                  onClick={() => onNavigate('market')}
                  className="px-6 py-3 bg-[#121212] text-[#fbf9f8] text-xs font-bold uppercase tracking-widest hover:bg-[#5e5e5b] transition-all"
                >
                  view catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-6 p-4 bg-white border border-[#121212]/5 items-center justify-between"
                  >
                    <div className="flex gap-4 items-center w-full">
                      <img
                        className="w-20 h-20 object-cover border border-[#121212]/5 shrink-0"
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-semibold text-[#121212]">{item.title}</h4>
                        <p className="text-xs text-[#5e5e5b] uppercase tracking-wider">{item.artist}</p>
                        <span className="inline-block px-2 py-0.5 bg-[#efeded] text-[9px] font-bold uppercase tracking-widest text-[#121212]">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-between items-end w-full sm:w-auto gap-4">
                      <p className="font-serif text-base font-bold text-[#121212]">
                        {item.priceUnit}
                        {item.price.toLocaleString()}
                      </p>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:opacity-75 transition-opacity"
                      >
                        remove item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Totals summary column */}
          <div className="lg:col-span-4 bg-white border border-[#121212]/5 p-6 space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#121212] border-b border-[#121212]/5 pb-3">
              Valuation summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#5e5e5b]">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span>
                  {currencyUnit}
                  {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#5e5e5b]">
                <span className="uppercase tracking-wider">Secure Transfer Fee</span>
                <span>
                  {currencyUnit}
                  {processingFee}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#121212] border-t border-[#121212]/5 pt-3">
                <span className="uppercase tracking-wider">Sovereign Total</span>
                <span className="font-serif text-lg">
                  {currencyUnit}
                  {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={cart.length === 0}
              className="w-full py-4 bg-[#121212] hover:bg-[#5e5e5b] disabled:bg-[#5e5e5b]/20 disabled:cursor-not-allowed text-[#fbf9f8] font-bold text-xs uppercase tracking-widest active:scale-95 transition-all duration-300 shadow-sm"
            >
              PROCEED TO SECURED CHECKOUT
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: Secured Checkout Form */}
      {step === 2 && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 bg-white border border-[#121212]/5 p-8 space-y-8">
            <h2 className="font-serif text-2xl font-semibold text-[#121212]">Secured Acquisition Form</h2>

            {/* Choose payment method */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Connected Wallet')}
                className={`p-4 border text-center transition-all flex flex-col items-center gap-2 select-none ${
                  paymentMethod === 'Connected Wallet'
                    ? 'border-violet-600 bg-violet-600/5 text-[#121212]'
                    : 'border-[#121212]/10 bg-white text-[#5e5e5b] hover:bg-[#121212]/5'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Connect Web3 Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Credit Card')}
                className={`p-4 border text-center transition-all flex flex-col items-center gap-2 select-none ${
                  paymentMethod === 'Credit Card'
                    ? 'border-violet-600 bg-violet-600/5 text-[#121212]'
                    : 'border-[#121212]/10 bg-white text-[#5e5e5b] hover:bg-[#121212]/5'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">credit_card</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Standard Credit Card</span>
              </button>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                    Collector Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3.5 focus:border-[#121212] text-xs font-semibold focus:ring-0 transition-all uppercase tracking-wider"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                    Collector Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3.5 focus:border-[#121212] text-xs font-semibold focus:ring-0 transition-all"
                  />
                </div>
              </div>

              {/* Connected Wallet field details */}
              {paymentMethod === 'Connected Wallet' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                    Connected Ethereum Wallet Address
                  </label>
                  <input
                    required
                    type="text"
                    value={walletAddr}
                    onChange={(e) => setWalletAddr(e.target.value)}
                    className="w-full bg-[#efeded] border-b border-[#121212]/15 p-3.5 focus:border-violet-600 text-xs font-mono focus:ring-0 transition-all"
                  />
                  <p className="text-[9px] font-bold uppercase text-violet-600 tracking-wider">
                    ● Sovereign wallet connected &amp; ready for gas execution
                  </p>
                </div>
              ) : (
                /* Credit card inputs */
                <div className="space-y-4 p-4 bg-[#efeded]/30 border border-[#121212]/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                      Card Number
                    </label>
                    <input
                      required
                      type="text"
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value)}
                      className="w-full bg-white border-b border-[#121212]/15 p-3 focus:border-violet-600 text-xs focus:ring-0 transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                        Expiration
                      </label>
                      <input
                        required
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-white border-b border-[#121212]/15 p-3 focus:border-violet-600 text-xs focus:ring-0 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#5e5e5b]">
                        CVV Code
                      </label>
                      <input
                        required
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={3}
                        className="w-full bg-white border-b border-[#121212]/15 p-3 focus:border-violet-600 text-xs focus:ring-0 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 border border-[#121212]/10 bg-white hover:bg-[#121212]/5 text-[#121212] font-bold text-xs uppercase tracking-widest transition-all"
                >
                  back
                </button>
                <button
                  type="submit"
                  className="px-10 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-sm"
                >
                  EXECUTE TRANSACTION
                </button>
              </div>
            </form>
          </div>

          {/* Pricing Summary Side-column */}
          <div className="lg:col-span-5 bg-white border border-[#121212]/5 p-6 space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#121212] border-b border-[#121212]/5 pb-3">
              Acquisition Items ({cart.length})
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    className="w-12 h-12 object-cover border"
                    src={item.imageUrl}
                    alt={item.title}
                  />
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#121212] truncate w-44">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-[#5e5e5b]">{item.artist}</p>
                    <p className="text-xs font-semibold text-[#121212] mt-0.5">
                      {item.priceUnit}
                      {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#121212]/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#121212]">
                <span className="uppercase tracking-wider">Sovereign Total Due</span>
                <span className="font-serif text-lg text-violet-600">
                  {currencyUnit}
                  {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: Transaction completed Tracking & Live receipt screen */}
      {step === 3 && createdOrder && (
        <section className="max-w-3xl mx-auto bg-white border border-[#121212]/5 p-8 md:p-12 space-y-8 rounded-xs shadow-md">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-6xl text-violet-600 animate-bounce">
              verified_user
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#121212]">Acquisition Successful</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5e5e5b]">
              Your transaction has been written to the sovereign blocks.
            </p>
          </div>

          {/* Tracking Status Timeline */}
          <div className="bg-[#efeded]/30 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#121212]/5 pb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#121212]">
                Sovereign Tracking History
              </h4>
              <span className="text-[9px] font-mono text-[#5e5e5b]">Receipt ID: {createdOrder.id}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <span className="material-symbols-outlined text-green-600 text-2xl">gavel</span>
                <p className="text-[10px] font-bold uppercase text-[#121212]">Block confirmed</p>
                <div className="h-1 bg-green-600 w-full rounded-full"></div>
              </div>

              <div className="space-y-2">
                <span
                  className={`material-symbols-outlined text-2xl ${
                    simulatedTransitStep === 'delivered' ? 'text-green-600' : 'text-violet-600 animate-pulse'
                  }`}
                >
                  local_shipping
                </span>
                <p className="text-[10px] font-bold uppercase text-[#121212]">Dispatch courier</p>
                <div
                  className={`h-1 w-full rounded-full ${
                    simulatedTransitStep === 'delivered' ? 'bg-green-600' : 'bg-violet-600'
                  }`}
                ></div>
              </div>

              <div className="space-y-2">
                <span
                  className={`material-symbols-outlined text-2xl ${
                    simulatedTransitStep === 'delivered' ? 'text-green-600' : 'text-gray-300'
                  }`}
                >
                  home_pin
                </span>
                <p className="text-[10px] font-bold uppercase text-[#121212]">Sovereign delivered</p>
                <div
                  className={`h-1 w-full rounded-full ${
                    simulatedTransitStep === 'delivered' ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            </div>

            {/* Interactive Transit accelerator */}
            {simulatedTransitStep === 'confirmed' && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleSimulateDispatch}
                  className="px-6 py-2.5 bg-[#121212] hover:bg-[#5e5e5b] text-[#fbf9f8] text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Simulate Delivery Arrival
                </button>
              </div>
            )}
          </div>

          {/* Receipt Info */}
          <div className="space-y-4 text-xs">
            <h4 className="font-serif text-lg font-bold text-[#121212] border-b border-[#121212]/5 pb-2">
              Sovereign Ledger Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-[#5e5e5b]">
              <div>
                <p className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Collector Name</p>
                <p className="font-semibold text-[#121212]">{createdOrder.name}</p>
              </div>
              <div>
                <p className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Payment method</p>
                <p className="font-semibold text-[#121212]">{createdOrder.paymentMethod}</p>
              </div>
              <div className="col-span-2">
                <p className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Ledger Block Hash</p>
                <p className="font-mono text-[#121212] truncate">{createdOrder.transactionHash}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#121212]/10 flex justify-center gap-4">
            <button
              onClick={() => onNavigate('market')}
              className="px-8 py-4 border border-[#121212]/10 bg-white hover:bg-[#121212]/5 text-[#121212] font-bold text-xs uppercase tracking-widest transition-all"
            >
              Discover More Art
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="px-8 py-4 bg-[#121212] hover:bg-[#5e5e5b] text-[#fbf9f8] font-bold text-xs uppercase tracking-widest transition-all"
            >
              Go to my Dashboard
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
