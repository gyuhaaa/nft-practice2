import {
  Box,
  Button,
  Flex,
  GridItem,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { Contract, formatEther, JsonRpcSigner } from "ethers";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

interface SaleNftCardProps {
  nftMetadata: NftMetadata;
  tokenId: number;
  mintContract: Contract | null;
  saleContract: Contract | null;
  signer: JsonRpcSigner | null;
  getOnSaleTokens: () => Promise<void>;
  getNftMetadata: () => Promise<void>;
}

const SaleNftCard: FC<SaleNftCardProps> = ({
  nftMetadata,
  tokenId,
  mintContract,
  saleContract,
  signer,
  getOnSaleTokens,
  getNftMetadata,
}) => {
  const [currentPrice, setCurrentPrice] = useState<bigint>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const getTokenPrice = async () => {
    try {
      const response = await saleContract?.getTokenPrice(tokenId);

      setCurrentPrice(response);
    } catch (error) {
      console.error(error);
    }
  };

  const getOwnerOf = async () => {
    try {
      const response = await mintContract?.ownerOf(tokenId);

      setIsOwner(signer?.address === response);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickPurchaseNft = async () => {
    try {
      setIsLoading(true);

      const response = await saleContract?.purchaseNft(tokenId, {
        value: currentPrice,
      });

      await response.wait();

      await getOnSaleTokens();
      await getNftMetadata();

      setIsLoading(false);
    } catch (error) {
      console.error(error);

      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!saleContract || !tokenId) return;

    getTokenPrice();
  }, [saleContract, tokenId]);

  useEffect(() => {
    if (!mintContract || !tokenId) return;

    getOwnerOf();
  }, [mintContract, tokenId]);

  return (
    <GridItem display="flex" flexDir="column">
      <Image
        alignSelf="center"
        src={nftMetadata.image}
        alt={nftMetadata.name}
      />
      <Popover>
        <PopoverTrigger>
          <Button mt={4} fontSize={24} fontWeight="semibold" variant="link">
            {nftMetadata.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>{nftMetadata.description}</PopoverBody>
        </PopoverContent>
      </Popover>
      <Flex flexWrap="wrap" mt={4} gap={2}>
        {nftMetadata.attributes?.map((w, j) => (
          <Box key={j} border="2px solid olive" p={1}>
            <Text borderBottom="2px solid olive">{w.trait_type}</Text>
            <Text>{w.value}</Text>
          </Box>
        ))}
      </Flex>
      <Flex mt={4} alignItems="center">
        {currentPrice ? (
          <>
            <Text>{formatEther(currentPrice)} ETH</Text>
            <Button
              ml={2}
              colorScheme="pink"
              onClick={onClickPurchaseNft}
              isDisabled={isLoading || isOwner}
              isLoading={isLoading}
              loadingText="로딩중"
            >
              구매
            </Button>
          </>
        ) : (
          ""
        )}
      </Flex>
    </GridItem>
  );
};

export default SaleNftCard;
