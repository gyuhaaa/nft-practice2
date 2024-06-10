import {
  Button,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { JsonRpcSigner } from "ethers";
import { Contract } from "ethers";
import { ethers } from "ethers";
import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import mintAbi from "../abis/mintAbi.json";
import saleAbi from "../abis/saleAbi.json";
import {
  mintContractAddress,
  saleContractAddress,
} from "../abis/contractAddress";

interface HeaderProps {
  signer: JsonRpcSigner | null;
  setSigner: Dispatch<SetStateAction<JsonRpcSigner | null>>;
  setMintContract: Dispatch<SetStateAction<Contract | null>>;
  setSaleContract: Dispatch<SetStateAction<Contract | null>>;
}

const Header: FC<HeaderProps> = ({
  signer,
  setSigner,
  setMintContract,
  setSaleContract,
}) => {
  const navigate = useNavigate();

  const onClickMetamask = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);

      setSigner(await provider.getSigner());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!signer) {
      setMintContract(null);

      return;
    }

    setMintContract(new Contract(mintContractAddress, mintAbi, signer));
    setSaleContract(new Contract(saleContractAddress, saleAbi, signer));
  }, [signer]);

  return (
    <Flex h={24} justifyContent="space-between">
      <Flex
        flexDir={["column", "column", "row"]}
        w={40}
        fontSize={[16, 16, 20]}
        fontWeight="semibold"
        alignItems="center"
      >
        <Image w={16} src="/images/logo.svg" alt="슬라임 월드" /> 슬라임 월드
      </Flex>
      <Flex alignItems="center" gap={[2, 2, 4]}>
        <Button
          variant="link"
          colorScheme="green"
          onClick={() => navigate("/")}
          size={["xs", "xs", "md"]}
        >
          홈
        </Button>
        <Button
          variant="link"
          colorScheme="green"
          onClick={() => navigate("/mint-nft")}
          size={["xs", "xs", "md"]}
        >
          민팅
        </Button>
        <Button
          variant="link"
          colorScheme="green"
          onClick={() => navigate("/my-nft")}
          size={["xs", "xs", "md"]}
        >
          내 NFT
        </Button>
        <Button
          variant="link"
          colorScheme="green"
          onClick={() => navigate("/sale-nft")}
          size={["xs", "xs", "md"]}
        >
          마켓
        </Button>
      </Flex>
      <Flex w={40} justifyContent="end" alignItems="center">
        {signer ? (
          <Menu>
            <MenuButton size={["xs", "xs", "md"]} as={Button}>
              {signer.address.substring(0, 5)}...
              {signer.address.substring(signer.address.length - 5)}
            </MenuButton>
            <MenuList minW={[20, 20, 40]}>
              <MenuItem fontSize={[8, 8, 12]} onClick={() => setSigner(null)}>
                Log Out
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button onClick={onClickMetamask} size={["xs", "xs", "md"]}>
            🦊 메마로그인
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default Header;
