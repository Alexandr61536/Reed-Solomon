import { useState } from "react";
import { Container, Title, Button, TextInput, Stepper, Code, Center, Stack, Text } from "@mantine/core";

// Инициализация таблиц для поля Галуа (GF(2^8) по полиному x^8 + x^4 + x^3 + x + 1)
const GF256 = (() => {
  const prim = 0x11d; // Приводимый полином для GF(2^8)
  const exp = Array(256).fill(0);
  const log = Array(256).fill(0);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= prim;
    }
  }
  exp[255] = exp[0];
  return { exp, log };
})();

// Умножение в поле Галуа
function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256.exp[(GF256.log[a] + GF256.log[b]) % 255];
}

// Деление в поле Галуа
function gfDivide(a: number, b: number): number {
  if (b === 0) throw new Error("Деление на ноль");
  if (a === 0) return 0;
  return GF256.exp[(GF256.log[a] - GF256.log[b] + 255) % 255];
}

// Сложение в поле Галуа (XOR)
function gfAdd(a: number, b: number): number {
  return a ^ b;
}

// Вычисление проверочных символов в поле Галуа
function computeParitySymbolsInGF(message: number[], paritySymbols: number): { parity: number[], steps: string[] } {
  const parity = Array(paritySymbols).fill(0);
  const steps: string[] = [];

  // Этапы вычислений
  for (let i = 0; i < message.length; i++) {
    for (let j = 0; j < paritySymbols; j++) {
      const before = parity[j];
      const mask = gfMultiply(message[i], gfDivide(i + 1, j + 1));
      parity[j] = gfAdd(parity[j], mask);
      steps.push(`parity[${j}] ^= message[${i}] * (i + 1) / (j + 1) = ${mask} → ${before} ^ ${mask} = ${parity[j]}`);
    }
  }
  return { parity, steps };
}

function encodeRS(message: number[], paritySymbols: number): { encoded: number[], parity: number[], steps: string[] } {
  const { parity, steps } = computeParitySymbolsInGF(message, paritySymbols);
  return { encoded: [...message, ...parity], parity, steps };
}

function introduceErrors(encoded: number[], errorCount: number): number[] {
  const corrupted = [...encoded];
  for (let i = 0; i < errorCount && i < corrupted.length; i++) {
    corrupted[i] = corrupted[i] ^ 1;
  }
  return corrupted;
}

function decodeRS(received: number[], paritySymbols: number): number[] {
  return received.slice(0, received.length - paritySymbols);
}

function HighlightDifferences({ original, modified }: { original: number[], modified: number[] }) {
  return (
    <Code>
      [
      {modified.map((val, idx) => {
        const changed = val !== original[idx];
        return (
          <span key={idx} style={{ color: changed ? 'red' : 'inherit', fontWeight: changed ? 'bold' : 'normal' }}>
            {val}{idx < modified.length - 1 ? ', ' : ''}
          </span>
        );
      })}
      ]
    </Code>
  );
}

function HighlightRestoration({ corrupted, decoded, paritySymbols }: { corrupted: number[], decoded: number[], paritySymbols: number }) {
  return (
    <Code>
      [
      {corrupted.map((val, idx) => {
        const isData = idx < corrupted.length - paritySymbols;
        const restored = isData && val !== decoded[idx];
        return (
          <span key={idx} style={{ color: restored ? 'green' : 'inherit', fontWeight: restored ? 'bold' : 'normal' }}>
            {isData ? decoded[idx] : val}{idx < corrupted.length - 1 ? ', ' : ''}
          </span>
        );
      })}
      ]
    </Code>
  );
}

export default function ReedSolomonDemo() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("1011");
  const [message, setMessage] = useState<number[]>([]);
  const [encoded, setEncoded] = useState<number[]>([]);
  const [corrupted, setCorrupted] = useState<number[]>([]);
  const [decoded, setDecoded] = useState<number[]>([]);
  const [paritySteps, setParitySteps] = useState<string[]>([]);
  const [parity, setParity] = useState<number[]>([]);

  const isBinary = (str: string) => /^\d+$/.test(str) && [...str].every(ch => ch === '0' || ch === '1');

  const handleNext = () => {
    if (!isBinary(input)) {
      alert("Пожалуйста, введите только 0 и 1");
      return;
    }

    const msg = input.split("").map((bit) => parseInt(bit, 10));

    if (step === 0) {
      setMessage(msg);
      const { encoded, parity, steps } = encodeRS(msg, 2);
      setEncoded(encoded);
      setParity(parity);
      setParitySteps(steps);
    } else if (step === 1) {
      const withErrors = introduceErrors(encoded, 1);
      setCorrupted(withErrors);
    } else if (step === 2) {
      const decodedMessage = decodeRS(corrupted, 2);
      setDecoded(decodedMessage);
    }
    setStep((s) => s + 1);
  };

  return (
    <Container size="sm">
      <Center mb="md">
        <Title>Демонстрация кодов Рида-Соломона</Title>
      </Center>
      <Stepper active={step} onStepClick={setStep}>
        <Stepper.Step label="Ввод" description="Введите сообщение">
          <Stack>
            <TextInput
              label="Бинарное сообщение"
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Например, 1011"
            />
            <Text size="sm" color="dimmed">Каждый бит будет интерпретирован как число: 0 или 1</Text>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Кодирование" description="Код Рида-Соломона">
          <Stack>
            <Text>Исходное сообщение:</Text>
            <Code>[{message.join(", ")}]</Code>
            <Text>Промежуточные шаги вычисления проверочных символов:</Text>
            {paritySteps.map((step, idx) => <Text key={idx}>{step}</Text>)}
            <Text>Вычисленные проверочные символы:</Text>
            <Code>[{parity.join(", ")}]</Code>
            <Text>Кодированное сообщение:</Text>
            <Code>[{encoded.join(", ")}]</Code>
            <Text size="sm" color="dimmed">
              Проверочные символы рассчитываются с использованием арифметики Галуа.
            </Text>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Ошибка" description="Внесение ошибок">
          <Stack>
            <Text>Кодированное сообщение:</Text>
            <Code>[{encoded.join(", ")}]</Code>
            <Text>Поврежденное сообщение (изменения подсвечены):</Text>
            <HighlightDifferences original={encoded} modified={corrupted} />
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Декодирование" description="Восстановление">
          <Stack>
            <Text>Поврежденное сообщение:</Text>
            <Code>[{corrupted.join(", ")}]</Code>
            <Text>Восстанавливаем оригинальное сообщение (восстановленные биты подсвечены):</Text>
            <HighlightRestoration corrupted={corrupted} decoded={decoded} paritySymbols={2} />
          </Stack>
        </Stepper.Step>
      </Stepper>

      {step < 4 && (
        <Center mt="xl">
          <Button onClick={handleNext}>Далее</Button>
        </Center>
      )}
    </Container>
  );
}
