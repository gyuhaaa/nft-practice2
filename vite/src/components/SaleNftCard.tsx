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

interface SaleNftCardProps {
  nftMetadata: NftMetadata;
  tokenId: number;
  saleContract: Contract | null;
}

const SaleNftCard: FC<SaleNftCardProps> = ({
  nftMetadata,
  tokenId,
  saleContract,
}) => {
  const [currentPrice, setCurrentPrice] = useState<bigint>();

  const getTokenPrice = async () => {
    try {
      const response = await saleContract?.getTokenPrice(tokenId);

      setCurrentPrice(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickPurchaseNft = async () => {
    try {
      const response = await saleContract?.purchaseNft(tokenId, {
        value: currentPrice,
      });

      await response.wait();
    } catch (error) {
      console.error(error);
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
      <Flex mt={4} alignItems="center">
        {currentPrice ? (
          <>
            <Text>{formatEther(currentPrice)} ETH</Text>
            <Button ml={2} colorScheme="pink" onClick={onClickPurchaseNft}>
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
