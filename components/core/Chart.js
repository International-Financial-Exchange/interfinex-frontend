import styled, { ThemeContext } from "styled-components";
import Text from "./Text";
import ChartJS from "chart.js";
import { TextOption } from "../core/TextOption";
import { useState, useRef, useEffect, useContext } from "react";
import Skeleton from "react-loading-skeleton";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../utils/constants";

const Container = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    height: ${CONTAINER_SIZING.medium};
    width: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr;
`;

const TitleContainer = styled.div`
    display: grid;
    padding: ${PIXEL_SIZING.medium};
    grid-template-columns: 1fr auto;
`;

let chart;
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
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [selectedDuration, setSelectedDuration] = useState();
    const selectedOption = options[selectedOptionIndex];

    useEffect(() => {
        if (!selectedDuration && options.last()?.data) 
            setSelectedDuration(Object.keys(options.last().data).last());
    }, [selectedOption.data]);

    const theme = useContext(ThemeContext);
    const chartRef = useRef({});

    useEffect(() => {
        if (chart) chart.destroy();

        const chartCtx = document.getElementById("chart-container").getContext("2d");
        chart = new ChartJS(chartCtx, {
            type: 'line',
			data: {
				datasets: [{
                    fill: false,
                    pointRadius: 0,
                    borderColor: theme.colors.primary,
					data: selectedOption.data[selectedDuration ?? Object.keys(options.last().data).last()],
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
                animation: {
                    duration: 0
                },
                legend: { display: false },
                maintainAspectRatio: false,
                responsiveAnimationDuration: 0,
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
    }, [selectedOption, selectedDuration, options]);

    return (
        <Container>
            <TitleContainer>
                <div style={{ display: "flex" }}>
                    {
                        options.map((option, index) => 
                            <TextOption 
                                selected={selectedOptionIndex === index}
                                onClick={() => setSelectedOptionIndex(index)}
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
            
            
            <div style={{ marginLeft: PIXEL_SIZING.larger }}>
                {
                    selectedOption.currentValue === null ?
                        <Skeleton width={CONTAINER_SIZING.tiny} height={PIXEL_SIZING.large} />
                    : 
                        <Text primary secondary style={{ fontWeight: "bold" }}>
                            {selectedOption.currentValue} <span style={{ fontSize: 13 }}>{selectedOption.suffix}</span> 
                        </Text> 
                }
            </div>

            <div style={{ position: "relative", height: "100%", width: "100%" }}>
                <canvas
                    id="chart-container"
                    ref={chartRef}
                />
            </div>
        </Container>
    );
};