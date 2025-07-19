# LaTeX Support in EchoLearn

EchoLearn now supports beautiful mathematical notation rendering using LaTeX syntax. This enhancement makes STEM learning much more effective by displaying mathematical expressions properly instead of messy plain text.

## Features

- **Inline Math**: Use `$...$` for inline mathematical expressions
- **Display Math**: Use `$$...$$` for centered, block-level mathematical expressions
- **Automatic Detection**: LaTeX expressions are automatically detected and rendered
- **Fallback Support**: If LaTeX rendering fails, the raw text is displayed with error styling
- **Search Highlighting**: Text search still works within mathematical content

## Supported Locations

LaTeX rendering is available in:
- ✅ Chat messages (main conversation)
- ✅ Quiz questions and answers
- ✅ AI feedback and explanations
- ✅ Message previews in sidebar
- ✅ Conversation transcripts

## Usage Examples

### Inline Math
```
The integral $\int_{a}^{b} f(x) dx$ represents the area under the curve.
```

### Display Math
```
The quadratic formula is:
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

### Common Mathematical Expressions

**Fractions:**
```
$\frac{1}{2}$ or $\frac{numerator}{denominator}$
```

**Integrals:**
```
$\int_{0}^{\infty} e^{-x} dx = 1$
```

**Summations:**
```
$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
```

**Greek Letters:**
```
$\alpha, \beta, \gamma, \pi, \sigma, \theta$
```

**Subscripts and Superscripts:**
```
$x_1, x_2, x^2, e^{i\pi}$
```

**Matrices:**
```
$$\begin{matrix} a & b \\ c & d \end{matrix}$$
```

**Square Roots:**
```
$\sqrt{2}$ or $\sqrt[3]{8}$
```

## How It Works

1. **Detection**: The system scans text for `$...$` and `$$...$$` patterns
2. **Parsing**: LaTeX expressions are extracted while preserving surrounding text
3. **Rendering**: Mathematical content is rendered using KaTeX library
4. **Integration**: Rendered math is seamlessly integrated with regular text

## Error Handling

If a LaTeX expression cannot be rendered (e.g., syntax error), the system:
- Displays the original text with red highlighting
- Logs the error to console for debugging
- Continues rendering other expressions normally

## Tips for AI Conversations

When discussing mathematical topics with EchoLearn, you can:
- Ask for explanations using proper mathematical notation
- Request step-by-step solutions with formatted equations
- Have the AI explain complex formulas with clear visual representation

## Example Conversation

**You:** "Can you explain the derivative of $x^2$?"

**EchoLearn:** "The derivative of $x^2$ is $2x$. This follows from the power rule: 
$$\frac{d}{dx}[x^n] = nx^{n-1}$$
So for $x^2$, we get $2x^{2-1} = 2x^1 = 2x$."

## Technical Details

- **Library**: KaTeX (fast, lightweight LaTeX renderer)
- **Performance**: Client-side rendering with minimal overhead
- **Compatibility**: Works in all modern browsers
- **Font Loading**: Automatic font loading for mathematical symbols

This feature significantly improves the learning experience for mathematics, physics, chemistry, engineering, and other STEM subjects! 