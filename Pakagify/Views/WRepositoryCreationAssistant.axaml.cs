using System;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
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

    public void OnClickOkBtn(object? sender, RoutedEventArgs e)
    {
        var githubFld = this.FindControl<TextBox>("GithubFld");
    }

    public void OnClickCancelBtn(object? sender, RoutedEventArgs e)
    {
        this.Close();
    }
}