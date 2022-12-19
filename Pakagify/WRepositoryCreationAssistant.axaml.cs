using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace Pakagify;

public partial class WRepositoryCreationAssistant : Window
{
    public WRepositoryCreationAssistant()
    {
        InitializeComponent();
#if DEBUG
        this.AttachDevTools();
#endif
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}