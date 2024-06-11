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
import axios from "axios";
import { Contract, formatEther, JsonRpcSigner } from "ethers";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

interface SaleNftCardProps {
  tokenId: number;
  mintContract: Contract | null;
  saleContract: Contract | null;
  signer: JsonRpcSigner | null;
  tokenIds: number[];
  setTokenIds: Dispatch<SetStateAction<number[]>>;
}

const SaleNftCard: FC<SaleNftCardProps> = ({
  tokenId,
  mintContract,
  saleContract,
  signer,
  tokenIds,
  setTokenIds,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftMetadata, setNftMetadata] = useState<SaleNftMetadata>();

  const getNftMetadata = async () => {
    try {
      const tokenURI = await mintContract?.tokenURI(tokenId);

      const metadataResponse = await axios.get<NftMetadata>(tokenURI);
      const priceResponse = await saleContract?.getTokenPrice(tokenId);
      const ownerResponse = await mintContract?.ownerOf(tokenId);

      setNftMetadata({
        ...metadataResponse.data,
        price: priceResponse,
        tokenOwner: ownerResponse,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onClickPurchaseNft = async () => {
    try {
      setIsLoading(true);

      const response = await saleContract?.purchaseNft(tokenId, {
        value: nftMetadata?.price,
      });

      await response.wait();

      const temp = tokenIds.filter((v) => {
        if (v !== tokenId) {
          return v;
        }
      });

      setTokenIds(temp);

      setIsLoading(false);
    } catch (error) {
      console.error(error);

      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!saleContract || !tokenId || !mintContract) return;

    getNftMetadata();
  }, [saleContract, mintContract, tokenId]);

  useEffect(() => console.log(nftMetadata), [nftMetadata]);

  return (
    <GridItem display="flex" flexDir="column">
      {nftMetadata ? (
        <>
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
            {nftMetadata.price ? (
              <>
                <Text>{formatEther(nftMetadata.price)} ETH</Text>
                <Button
                  ml={2}
                  colorScheme="pink"
                  onClick={onClickPurchaseNft}
                  isDisabled={
                    isLoading || nftMetadata.tokenOwner === signer?.address
                  }
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
        </>
      ) : (
        ""
      )}
    </GridItem>
  );
};

export default SaleNftCard;
