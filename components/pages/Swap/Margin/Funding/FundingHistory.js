import { CONTAINER_SIZING, PIXEL_SIZING, shade } from "../../../../../utils";
import { Card } from "../../../../core/Card";
import Text from "../../../../core/Text";
import styled from "styled-components";

const Row = styled.tr`
    background-color: ${({ theme, positive }) => shade(positive ? theme.colors.positive : theme.colors.negative, 0.9)};
    color: ${({ theme, positive }) => positive ? theme.colors.positive : theme.colors.negative};
    margin-top: ${PIXEL_SIZING.medium};
    border-radius: ${PIXEL_SIZING.miniscule};
    font-weight: bold;
    transition: all 0.1s ease-out;

    &:hover { 
        cursor: pointer;
        transform: scale(1.02);
    }

    td {
        padding: ${PIXEL_SIZING.tiny};
        text-align: center;
        border: none;

        &:first-child {
            border-radius: ${PIXEL_SIZING.miniscule} 0 0 ${PIXEL_SIZING.miniscule};
        }
        
        &:last-child {
            border-radius: 0 ${PIXEL_SIZING.miniscule} ${PIXEL_SIZING.miniscule} 0;
        }
    }
`;

export const FundingHistory = () => {
    return (
        <Card style={{ width: "100%", height: CONTAINER_SIZING.medium, paddingTop: 0 }}>
            <table style={{ borderCollapse: "separate", borderSpacing: `0 ${PIXEL_SIZING.tiny}` }}>
                <tr>
                    <th style={{ padding: PIXEL_SIZING.small }}>
                        <Text secondary>Event</Text>
                    </th>
                    <th>
                        <Text secondary>Volume</Text>
                    </th>
                    <th>
                        <Text secondary>Timestamp</Text>
                    </th>
                    <th>
                        <Text secondary>User</Text>
                    </th>
                </tr>

                <Row positive>
                    <td>Deposit</td>
                    <td>100.87</td>
                    <td>16:34</td>
                    <td>0x089103</td>
                </Row>

                <Row positive>
                    <td>Deposit</td>
                    <td>100.87</td>
                    <td>16:34</td>
                    <td>0x089103</td>
                </Row>
            </table>
        </Card>
    );
};