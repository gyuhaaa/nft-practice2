import {
  Box,
  Button,
  Flex,
  GridItem,
  Image,
  Input,
  InputGroup,
  InputRightAddon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { Contract, formatEther, parseEther } from "ethers";
import { FC, useEffect, useState } from "react";

interface NftCardProps {
  nftMetadata: NftMetadata;
  tokenId: number;
  saleContract: Contract | null;
  isApprovedForAll: boolean;
}

const NftCard: FC<NftCardProps> = ({
  nftMetadata,
  tokenId,
  saleContract,
  isApprovedForAll,
}) => {
  const [currentPrice, setCurrentPrice] = useState<bigint>();
  const [salePrice, setSalePrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTokenPrice = async () => {
    try {
      const response = await saleContract?.getTokenPrice(tokenId);

      setCurrentPrice(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickSetForSaleNft = async () => {
    try {
      if (!salePrice || isNaN(Number(salePrice))) return;

      setIsLoading(true);

      const response = await saleContract?.setForSaleNft(
        tokenId,
        parseEther(salePrice)
      );

      await response.wait();

      setCurrentPrice(parseEther(salePrice));

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
      <Flex mt={4}>
        {currentPrice ? (
          <Text>{formatEther(currentPrice)} ETH</Text>
        ) : isApprovedForAll ? (
          <>
            <InputGroup>
              <Input
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                textAlign="right"
                isDisabled={isLoading}
              />
              <InputRightAddon>ETH</InputRightAddon>
            </InputGroup>
            <Button
              ml={2}
              onClick={onClickSetForSaleNft}
              isDisabled={isLoading}
              isLoading={isLoading}
              loadingText="로딩중"
            >
              등록
            </Button>
          </>
        ) : (
          ""
        )}
      </Flex>
    </GridItem>
  );
};

export default NftCard;
