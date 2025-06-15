// ConnectWallet.tsx
import { useConnectModal } from "@tomo-inc/tomo-evm-kit";

const ConnectTomo = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <button
      onClick={openConnectModal}
      className="bg-protocol-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-150 ease-in-out flex items-center justify-center text-lg mb-10 drop-shadow-neon-blue hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]"
    >
      Log in to your Tommo wallet account.
    </button>
  );
};

export default ConnectTomo;
