import {
  Box,
  Button,
  Flex,
  Grid,
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
import { FC, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { OutletContext } from "../components/Layout";
import axios from "axios";
import { saleContractAddress } from "../abis/contractAddress";

const PAGE = 3;

const MyNft: FC = () => {
  const [nftMetadataArray, setNftMetadataArray] = useState<NftMetadata[]>([]);
  const [balanceOf, setBalanceOf] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApprovedForAll, setIsApprovedForAll] = useState<boolean>(false);
  const [isApproveLoading, setIsApproveLoading] = useState<boolean>(false);

  const { mintContract, signer } = useOutletContext<OutletContext>();

  const getBalanceOf = async () => {
    try {
      const response = await mintContract?.balanceOf(signer?.address);

      setBalanceOf(Number(response));
    } catch (error) {
      console.error(error);
    }
  };

  const getNftMetadata = async () => {
    try {
      setIsLoading(true);

      const temp: NftMetadata[] = [];

      for (let i = 0; i < PAGE; i++) {
        if (i + currentPage * PAGE >= balanceOf) {
          setIsEnd(true);
          break;
        }

        const tokenOfOwnerByIndex = await mintContract?.tokenOfOwnerByIndex(
          signer?.address,
          i + currentPage * PAGE
        );

        const tokenURI = await mintContract?.tokenURI(tokenOfOwnerByIndex);

        const axiosResponse = await axios.get<NftMetadata>(tokenURI);

        temp.push(axiosResponse.data);
      }

      setNftMetadataArray([...nftMetadataArray, ...temp]);
      setCurrentPage(currentPage + 1);
      setIsLoading(false);
    } catch (error) {
      console.error(error);

      setIsLoading(false);
    }
  };

  const getIsApprovedForAll = async () => {
    try {
      const response = await mintContract?.isApprovedForAll(
        signer?.address,
        saleContractAddress
      );

      setIsApprovedForAll(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickSetApprovalForAll = async () => {
    try {
      setIsApproveLoading(true);

      const response = await mintContract?.setApprovalForAll(
        saleContractAddress,
        !isApprovedForAll
      );

      await response.wait();

      setIsApprovedForAll(!isApprovedForAll);
      setIsApproveLoading(false);
    } catch (error) {
      console.error(error);

      setIsApproveLoading(false);
    }
  };

  useEffect(() => {
    if (!mintContract || !signer) return;

    getBalanceOf();
    getIsApprovedForAll();
  }, [mintContract, signer]);

  useEffect(() => {
    if (signer) return;

    setBalanceOf(0);
  }, [signer]);

  useEffect(() => {
    if (!balanceOf) return;

    getNftMetadata();
  }, [balanceOf]);

  return (
    <Flex w="100%" alignItems="center" flexDir="column" gap={2} mt={8} mb={20}>
      {signer ? (
        <>
          <Flex alignItems="center" gap={2}>
            <Text>판매 권한 : {isApprovedForAll ? "승인" : "거부"}</Text>
            <Button
              colorScheme={isApprovedForAll ? "red" : "green"}
              onClick={onClickSetApprovalForAll}
              isDisabled={isApproveLoading}
              isLoading={isApproveLoading}
              loadingText="로딩중"
            >
              {isApprovedForAll ? "취소" : "승인"}
            </Button>
          </Flex>
          {balanceOf !== 0 && <Text>내 보유 NFT 갯수 : {balanceOf}</Text>}
          <Grid
            templateColumns={[
              "repeat(1, 1fr)",
              "repeat(1, 1fr)",
              "repeat(2, 1fr)",
            ]}
            gap={6}
          >
            {nftMetadataArray.map((v, i) => (
              <GridItem display="flex" key={i} flexDir="column">
                <Image alignSelf="center" src={v.image} alt={v.name} />
                <Popover>
                  <PopoverTrigger>
                    <Button
                      mt={4}
                      fontSize={24}
                      fontWeight="semibold"
                      variant="link"
                    >
                      {v.name}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>{v.description}</PopoverBody>
                  </PopoverContent>
                </Popover>
                <Flex flexWrap="wrap" mt={4} gap={2}>
                  {v.attributes?.map((w, j) => (
                    <Box key={j} border="2px solid olive" p={1}>
                      <Text borderBottom="2px solid olive">{w.trait_type}</Text>
                      <Text>{w.value}</Text>
                    </Box>
                  ))}
                </Flex>
              </GridItem>
            ))}
          </Grid>
          {!isEnd && (
            <Button
              onClick={() => getNftMetadata()}
              isDisabled={isLoading}
              isLoading={isLoading}
              loadingText="로딩중"
            >
              더 보기
            </Button>
          )}
        </>
      ) : (
        <Text>🦊 메타마스크 로그인이 필요합니다!</Text>
      )}
    </Flex>
  );
};

export default MyNft;
