import { Button, Center, Container, Stack, Stepper, TextInput, Title, Text, SegmentedControl, NumberInput, Table } from "@mantine/core"
import { useEffect, useState } from "react";
import { GF256 } from "./GF256";

const GaluaSandbox = () => {
    const [a, setA] = useState('')
    const [b, setB] = useState('')
    const [op, setOp] = useState('+')
    const [c, setC] = useState('')

    useEffect(()=>{
        if (a !== '' && b !== ''){
            if (op === "+") setC(GF256.add(parseInt(a), parseInt(b)).toString())
            if (op === "*") setC(GF256.multiply(parseInt(a), parseInt(b)).toString())
            if (op === "/") setC(GF256.divide(parseInt(a), parseInt(b)).toString())
        }
    else setC('')
    }, [a,b,op])

    return(
        <Stack>
            <NumberInput min={0} max={255} value={parseInt(a)} onChange={(e) => setA(e.toString())}/>
            <NumberInput min={0} max={255} value={parseInt(b)} onChange={(e) => setB(e.toString())}/>
            <SegmentedControl 
                value={op}
                onChange={setOp}
                data={[
                    "+",
                    "*",
                    "/"
                ]}
            />
            {c !== '' &&
                <Text>{`${a} ${op} ${b} = ${c}`}</Text>
            }
        </Stack>
    )
}

export const ReedSolomon = () => {

    const [step, setStep] = useState(0);
    const [input, setInput] = useState("Hello, world!");

    const [shifted, setShifted] = useState<number[]>([])
    const [counted, setCounted] = useState<number[]>([])
    const [a, setA] = useState(1)
    const [b, setB] = useState(1)
    const [errorPosition1, setErrorPosition1] = useState<number>(4)
    const [errorPosition2, setErrorPosition2] = useState<number>(5)
    const [syndrom, setSyndrom] = useState<number[]>([])
    const [errased, setErrased] = useState<number[]>([])
    const [syndromErrased, setSyndromErrased] = useState<number[]>([])
    const [locator, setLocator] = useState<number[]>([])
    const [positions,setPositions] = useState<number[]>([])
    const [magnitudes, setMagnitudes] = useState<number[]>([])
    const [corrected, setCorrected] = useState<number[]>([])

    useEffect(()=>{
        setShifted([0, 0, 0, 0].concat(Array.from(input).map((_, index) => {
            return input.charCodeAt(index)
        })))
    }, [input])

    useEffect(()=>{
        let mod = GF256.polynomialMod(
            Array.from(shifted).reverse(),
            Array.from([116, 231, 216, 30, 1]).reverse()
        )
        setCounted(
            Array.from(mod).reverse().concat(
            Array.from(input).map((_, index) => {
                return input.charCodeAt(index)
            }))
        )
    }, [shifted])

    useEffect(()=>{
        let tmp = [...counted]
        tmp[errorPosition1] = GF256.add(tmp[errorPosition1], a) 
        tmp[errorPosition2] = GF256.add(tmp[errorPosition2], b) 
        setErrased([...tmp])
    }, [counted, errorPosition1, errorPosition2, a, b])

    useEffect(()=>{
        let tmp = [
            GF256.evaluatePolynomial(Array.from(counted).reverse(), 2),
            GF256.evaluatePolynomial(Array.from(counted).reverse(), 4),
            GF256.evaluatePolynomial(Array.from(counted).reverse(), 8),
            GF256.evaluatePolynomial(Array.from(counted).reverse(), 16)
        ]
        setSyndrom(tmp)
    }, [counted])

    useEffect(()=>{
        let tmp = [
            GF256.evaluatePolynomial(Array.from(errased).reverse(), 2),
            GF256.evaluatePolynomial(Array.from(errased).reverse(), 4),
            GF256.evaluatePolynomial(Array.from(errased).reverse(), 8),
            GF256.evaluatePolynomial(Array.from(errased).reverse(), 16)
        ]
        setSyndromErrased(tmp)
    }, [errased])

    useEffect(()=>{
        setLocator([...GF256.berlekampMassey(Array.from(syndromErrased).reverse())].reverse())
    }, [syndromErrased])

    useEffect(()=>{
        setPositions(GF256.findErrorPositions([...locator].reverse(), errased.length))
    }, [locator])

    useEffect(()=>{
        if (positions.length > 0)
            setMagnitudes(GF256.computeErrorMagnitudes([...syndromErrased].reverse(), [...locator].reverse(), [...positions], errased.length))
    }, [positions])

    useEffect(()=>{
        setCorrected([...GF256.correctMessage([...errased].reverse(), [...positions].reverse(), [...magnitudes].reverse())].reverse())
    }, [magnitudes])

    return(
        <Container size="sm">
            <Stack>
            <Title>Калькулятор в поле GF(256)</Title>
            <GaluaSandbox/>
            <Center mb="md">
            <Title>Демонстрация кодов Рида-Соломона</Title>
            </Center>
            <Stepper active={step} onStepClick={setStep}>
            <Stepper.Step label="Ввод" description="Введите сообщение">
                <Stack>
                <TextInput
                    minLength={4}
                    label="Сообщение"
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                />
                <Text size="sm" color="dimmed">Каждый символ будет интерпретирован как число</Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {Array.from(input).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {Array.from(input).map((symbol, _) => {
                                return <td>{symbol}</td>
                            })}
                        </tr>
                        <tr>
                            {Array.from(input).map((_, index) => {
                                return <td>{input.charCodeAt(index)}</td>
                            })}
                        </tr>
                    </tbody>
                </Table>
                </Stack>
            </Stepper.Step>
            <Stepper.Step label="Кодирование" description="Код Рида-Соломона">
                <Stack>
                <Text>Чтобы создать код Рида-Соломона с 4 избыточными символами, сдвигаем полином вправо на 4 позиции (что эквивалентно умножению его на x^4)</Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((symbol, _) => {
                                return <td>{symbol}</td>
                            })}
                        </tr>
                        <tr>
                            {shifted.map(x => <td>{x}</td>)}
                        </tr>
                    </tbody>
                </Table>
                <Text>Теперь делим полученный полином на полином-генератор (2 + x)(4 + x)(8 + x)(16 + x) (116, 231, 216, 30, 1) и берём остаток от деления, записывая его вместо нулей </Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {(["r0", "r1", "r2", "r3", ...Array.from(input)]).map((symbol, _) => {
                                return <td>{symbol}</td>
                            })}
                        </tr>
                        <tr>
                            {counted.map(x => <td>{x}</td>)}
                        </tr>
                    </tbody>
                </Table>
                </Stack>
            </Stepper.Step>
            <Stepper.Step label="Ошибка" description="Внесение ошибок">
                <Stack>
                <Text>Кодированное сообщение:</Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {(["r0", "r1", "r2", "r3", ...Array.from(input)]).map((symbol, index) => {
                                if (index < 4) return <td>{symbol}</td>
                                if (index >=4) return <td></td>
                            })}
                        </tr>
                        <tr>
                            {counted.map(x => <td>{x}</td>)}
                        </tr>
                    </tbody>
                </Table>
                <Text>Нужно вычислить полином сообщения с избыточными символами при x равном степеням примитивного члена: a^1,a^2,...,a^M, M– количество избыточных символов, a – примитивный член (так как ошибок нет, синдромы должны быть равны 0).</Text>
                <Table>
                    <thead>
                        <tr>
                            <td>a^1</td>
                            <td>a^2</td>
                            <td>a^3</td>
                            <td>a^4</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {syndrom.map(x=><td>{x}</td>)}
                        </tr>
                    </tbody>
                </Table>
                <Text style={{display: "flex", flexDirection: "row", gap: "7px", flexWrap: "wrap"}}>
                    <span style={{whiteSpace: "nowrap"}}>Увеличим</span>
                    <NumberInput 
                        style={{width: 70}}
                        value={errorPosition1} 
                        onChange={e => typeof e === 'number' ? setErrorPosition1(e) : setErrorPosition1(parseInt(e))}
                        min={4}
                        max={counted.length - 1}
                    /> 
                    <span style={{whiteSpace: "nowrap"}}>и</span>
                    <NumberInput 
                        style={{width: 70}}
                        value={errorPosition2} 
                        onChange={e => typeof e === 'number' ? setErrorPosition2(e) : setErrorPosition2(parseInt(e))}
                        min={4}
                        max={counted.length - 1}
                    />
                    <span style={{whiteSpace: "nowrap"}}>числа сообщения на</span> 
                    <NumberInput 
                        style={{width: 70}}
                        min={0} 
                        max={255} 
                        value={a} 
                        onChange={(e) => typeof e === 'number' ? setA(e) : setA(parseInt(e))}
                    /> 
                    <span style={{whiteSpace: "nowrap"}}>и</span> 
                    <NumberInput 
                        style={{width: 70}}
                        min={0} 
                        max={255} 
                        value={b} 
                        onChange={(e) => typeof e === 'number' ? setB(e) : setB(parseInt(e))}
                    /> 
                    <span style={{whiteSpace: "nowrap"}}>(сложение производится в поле GF(256)), внося ошибку:</span>
                </Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {(["r0", "r1", "r2", "r3", ...Array.from(input)]).map((symbol, index) => {
                                if (index < 4) return <td>{symbol}</td>
                                if (index >=4) return <td></td>
                            })}
                        </tr>
                        <tr>
                            {errased.map((x, index) => {
                                if (index < 4)
                                    return <td>{x}</td>
                                else return(
                                    <td style={index === errorPosition1 || index === errorPosition2 ? {backgroundColor: "rgba(255, 0, 0, 0.5)"} : {}}>
                                        {x}
                                    </td>
                                )
                            })}
                        </tr>
                    </tbody>
                </Table>
                <Text>Снова вычислим синдромы (они должны отличаться от нуля, т.к. меньше 2 ошибок или 4 опечаток).</Text>
                <Table>
                    <thead>
                        <tr>
                            <td>a^1</td>
                            <td>a^2</td>
                            <td>a^3</td>
                            <td>a^4</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {syndromErrased.map(x=><td>{x}</td>)}
                        </tr>
                    </tbody>
                </Table>
                </Stack>
            </Stepper.Step>



            <Stepper.Step label="Декодирование" description="Восстановление">
                <Stack>
                <Text>Поврежденное сообщение:</Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {(["r0", "r1", "r2", "r3", ...Array.from(input)]).map((symbol, index) => {
                                if (index < 4) return <td>{symbol}</td>
                                if (index >=4) return <td></td>
                            })}
                        </tr>
                        <tr>
                            {errased.map((x, index) => {
                                if (index < 4)
                                    return <td>{x}</td>
                                else return(
                                    <td style={index === errorPosition1 ||index === errorPosition2 ? {backgroundColor: "rgba(255, 0, 0, 0.5)"} : {}}>
                                        {x}
                                    </td>
                                )
                            })}
                        </tr>
                    </tbody>
                </Table>
                <Text>Полином синдромов:</Text>
                <Table>
                    <thead>
                        <tr>
                            {syndromErrased.map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {syndromErrased.map((x, _) => {
                                return <td>{x}</td>
                            })}
                        </tr>
                    </tbody>
                </Table>
                <Text>Найдём из него полином-локатор (алгоритмом Берлекэмпа-Мэсси):</Text>
                <Table>
                    <thead>
                        <tr>
                            {locator.map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {locator.map((x, _) => {
                                return <td>{x}</td>
                            })}
                        </tr>
                    </tbody>
                </Table>
                <Text>Найдём из него позиции ошибок (алгоритмом Ченя, номер ошибок указывается с конца, начиная с 0):</Text>
                <Table>
                    <thead>
                        <tr>
                            {positions.map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {positions.map((x, _) => {
                                return <td>{x}</td>
                            })}
                        </tr>
                    </tbody>
                </Table>

                <Text>Поврежденное сообщение:</Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{errased.length - index - 1}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {(["r0", "r1", "r2", "r3", ...Array.from(input)]).map((symbol, index) => {
                                if (index < 4) return <td>{symbol}</td>
                                if (index >=4) return <td></td>
                            })}
                        </tr>
                        <tr>
                            {errased.map((x, index) => {
                                if (index < 4)
                                    return <td>{x}</td>
                                else return(
                                    <td style={(index === errorPosition1 ||index === errorPosition2) && (counted[index] !== errased[index]) ? {backgroundColor: "rgba(255, 0, 0, 0.5)"} : {}}>
                                        {x}
                                    </td>
                                )
                            })}
                        </tr>
                        <tr>
                            {errased.map((_, index) => {
                                if (positions.includes(errased.length - index - 1))
                                    return <td>^</td>
                                return <td> </td>
                            })}
                        </tr>
                    </tbody>
                </Table>

                <Text>После корректировки амплитудами ошибок {JSON.stringify(magnitudes)} (полученными из полинома синдромов, полинома-локатора и позиций ошибок):</Text>
                <Table withColumnBorders>
                    <thead>
                        <tr>
                            <td></td>
                            {([0, 0, 0, 0, ...Array.from(input)]).map((_, index) => {
                                return <td>{index}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Исходное</td>
                            {counted.map(x=><td>{x}</td>)}
                        </tr>
                        <tr>
                            <td>Ошибочное</td>
                            {errased.map(x=><td>{x}</td>)}
                        </tr>
                        <tr>
                            <td>Исправленное</td>
                            {corrected.map(x=><td>{x}</td>)}
                        </tr>
                        <tr>
                            <td></td>
                            {errased.map((_, index) => {
                                if (positions.includes(errased.length - index - 1))
                                    return <td>^</td>
                                return <td> </td>
                            })}
                        </tr>
                    </tbody>
                </Table>
                </Stack>
            </Stepper.Step>
            </Stepper>
    
            {step < 3 && (
            <Center mt="xl">
                <Button onClick={()=>{setStep(step+1)}}>Далее</Button>
            </Center>
            )}
            </Stack>
        </Container>
    )
}