import styled, { ThemeContext } from "styled-components";
import { PIXEL_SIZING, CONTAINER_SIZING } from "../../utils";
import Text from "./Text";
import ChartJS from "chart.js";
import { TextOption } from "../core/TextOption";
import { useState, useRef, useEffect, useContext } from "react";

const Container = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    height: ${CONTAINER_SIZING.medium};
    width: 100%;
`;

const TitleContainer = styled.div`
    display: grid;
    padding: ${PIXEL_SIZING.medium};
    grid-template-columns: 1fr auto;
`;

export const Chart = ({ 
    options = [
        { 
            label: "Price", 
            value: "PRICE", 
            currentValue: 8123.23,
            suffix: "USDT",
            data: {
                ["1H"]: [{
                    x: new Date("08/07/2016"),
                    y: 16
                }, {
                    x: new Date("09/07/2016"),
                    y: 3
                }, {
                    x: new Date("10/07/2016"),
                    y: 24
                }, {
                    x: new Date("11/07/2016"),
                    y: 4
                }],
                ["24H"]: [{
                    x: new Date("08/07/2016"),
                    y: 12
                }, {
                    x: new Date("09/07/2016"),
                    y: 4
                }, {
                    x: new Date("10/07/2016"),
                    y: 222
                }, {
                    x: new Date("11/07/2016"),
                    y: 135
                }],
                ["1W"]: [],
                ["1M"]: [],
                ["ALL"]: [],
            },
        },
    ]
}) => {
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [selectedDuration, setSelectedDuration] = useState(Object.keys(options.first().data).first());
    const theme = useContext(ThemeContext);
    const chartRef = useRef({});


    useEffect(() => {
        const chartCtx = chartRef.current.getContext("2d");
        new ChartJS(chartCtx, {
            type: 'line',
			data: {
				datasets: [{
                    fill: false,
                    pointRadius: 0,
                    borderColor: theme.colors.primary,
					data: selectedOption.data[selectedDuration],
				}],
            },
            
			options: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    displayColors: false,
                    callbacks: {
                        label: ({ yLabel })  => `${yLabel} ${selectedOption.suffix}`
                    }
                },
                responsive: true,
                legend: { display: false },
				scales: {
					xAxes: [{
                        type: "time",
                        display: false,
                        gridLines : {
                            display : false
                        }
                    }],
                    
					yAxes: [{
                        display: false,
                        gridLines : {
                            display : false
                        }
					}]
				}
			}
		});
    }, [selectedOption, selectedDuration]);

    return (
        <Container>
            <TitleContainer>
                <div style={{ display: "flex" }}>
                    {
                        options.map(option => 
                            <TextOption 
                                selected={selectedOption.value === option.value}
                                onClick={() => setSelectedOption(option)}
                            >
                                {option.label}
                            </TextOption>
                        )
                    }
                </div>

                <div style={{ display: "flex" }}>
                    {
                        Object.keys(selectedOption.data).map(duration => 
                            <TextOption 
                                selected={selectedDuration === duration}
                                onClick={() => setSelectedDuration(duration)}
                            >
                                {duration}
                            </TextOption>
                        )    
                    }
                </div>
            </TitleContainer>

            <div style={{ marginTop: PIXEL_SIZING.medium, position: "relative" }}>
                <div style={{ position: "absolute", left: PIXEL_SIZING.larger, top: 0 }}>
                    <Text primary secondary style={{ fontWeight: "bold" }}>
                        {selectedOption.currentValue} <span style={{ fontSize: 13 }}>{selectedOption.suffix}</span> 
                    </Text>
                </div>

                <canvas
                    style={{ height: 270, width: "100%" }}
                    id="chart-container"
                    ref={chartRef}
                />
            </div>
        </Container>
    );
};